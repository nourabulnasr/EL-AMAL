import {test} from 'node:test';
import assert from 'node:assert/strict';
import {deflateRawSync} from 'node:zlib';
import * as files from '../src/lib/enquiry-attachments.ts';
// Deliberately tiny OOXML fixtures; no Excel process or formula engine is used.
function zip(entries){
 const local=[],central=[];let offset=0;
 for(const [name,value] of Object.entries(entries)){
  const path=Buffer.from(name),raw=Buffer.from(value),compressed=deflateRawSync(raw),h=Buffer.alloc(30),c=Buffer.alloc(46);
  h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(8,8);h.writeUInt32LE(compressed.length,18);h.writeUInt32LE(raw.length,22);h.writeUInt16LE(path.length,26);
  c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,6);c.writeUInt16LE(8,10);c.writeUInt32LE(compressed.length,20);c.writeUInt32LE(raw.length,24);c.writeUInt16LE(path.length,28);c.writeUInt32LE(offset,42);
  local.push(h,path,compressed);central.push(c,path);offset+=h.length+path.length+compressed.length;
 }
 const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(central.length/2,8);end.writeUInt16LE(central.length/2,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
 return Buffer.concat([...local,directory,end]);
}
const xlsx='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const workbook=()=>({'[Content_Types].xml':'<Types><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/></Types>','_rels/.rels':'<Relationships/>','xl/workbook.xml':'<workbook/>','xl/worksheets/sheet1.xml':'<worksheet><sheetData/></worksheet>'});
const validate=(bytes,type,name)=>{assert.equal(typeof files.validateQuotationFile,'function');return files.validateQuotationFile(bytes,type,name);};
test('quotation PDFs remain explicitly unscanned, bounded documents',async()=>{
 const bytes=Buffer.from('%PDF-1.7\n1 0 obj << /Type /Catalog >> endobj\n%%EOF\n');
 const result=await validate(bytes,'application/pdf','quote.pdf');
 assert.deepEqual(result.bytes,bytes);assert.equal(result.contentType,'application/pdf');assert.equal(result.safety,'unscanned-document');
});
test('quotation rejects spoofed, encrypted, active and oversized PDFs',async()=>{
 for(const bytes of [Buffer.from('not PDF'),Buffer.from('%PDF-1.7\n/Encrypt 1 0 R\n%%EOF'),Buffer.from('%PDF-1.7\n/Java#53cript\n%%EOF'),Buffer.alloc(2097153)]) await assert.rejects(async()=>validate(bytes,'application/pdf','quote.pdf'));
 await assert.rejects(async()=>validate(Buffer.from('%PDF-1.7\n%%EOF'),'application/pdf','quote.exe'));
});
test('bounded XLSX package accepts a plain workbook while retaining unscanned status',async()=>{
 const bytes=zip(workbook()),result=await validate(bytes,xlsx,'quote.xlsx');
 assert.deepEqual(result.bytes,bytes);assert.equal(result.safety,'unscanned-document');
});
test('XLSX accepts a workbook whose remaining worksheet is not sheet1',async()=>{
 const entries=workbook();entries['xl/worksheets/sheet2.xml']=entries['xl/worksheets/sheet1.xml'];delete entries['xl/worksheets/sheet1.xml'];
 assert.equal((await validate(zip(entries),xlsx,'quote.xlsx')).contentType,xlsx);
});
test('XLSX rejects macros, external relationships, traversal, XML entities and decompression bombs',async()=>{
 for(const change of [
  {'xl/vbaProject.bin':'malicious'},
  {'xl/_rels/workbook.xml.rels':'<Relationships><Relationship TargetMode="External" Target="https://attacker.invalid"/></Relationships>'},
  {'../escape.xml':'<x/>'},
  {'xl/workbook.xml':'<!DOCTYPE x [<!ENTITY boom SYSTEM "file:///private">]><workbook/>'},
  {'xl/worksheets/sheet1.xml':'x'.repeat(9*1024*1024)},
 ])await assert.rejects(async()=>validate(zip({...workbook(),...change}),xlsx,'quote.xlsx'));
 await assert.rejects(async()=>validate(zip(workbook()),'application/vnd.ms-excel','quote.xls'));
});
