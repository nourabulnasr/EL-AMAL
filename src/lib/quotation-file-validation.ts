import {inflateRawSync} from 'node:zlib';

export const spreadsheetType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const reject=()=>{throw new Error('Use a plain PDF or XLSX without encryption, macros or external links');};

/** A deliberately restricted ZIP/OOXML format check, NOT malware scanning or CDR.
 * Nothing is extracted to disk, rendered, evaluated or fetched from a relationship.
 * ZIP64, encrypted archives, overlapping entries and unexpected package parts fail closed.
 */
export function validateSpreadsheet(bytes:Buffer){
  if(bytes.length<22||bytes.readUInt32LE(0)!==0x04034b50)reject();
  let end=-1;
  for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--){
    if(bytes.readUInt32LE(p)===0x06054b50&&p+22+bytes.readUInt16LE(p+20)===bytes.length){end=p;break;}
  }
  if(end<0)reject();
  const count=bytes.readUInt16LE(end+10),directorySize=bytes.readUInt32LE(end+12),directory=bytes.readUInt32LE(end+16);
  if(bytes.readUInt16LE(end+4)||bytes.readUInt16LE(end+6)||bytes.readUInt16LE(end+8)!==count||!count||count>200||directory+directorySize!==end)reject();
  let position=directory,total=0,localEnd=0;
  const names=new Set<string>(),xml=new Map<string,string>();
  const utf8=new TextDecoder('utf-8',{fatal:true});
  for(let i=0;i<count;i++){
    if(position+46>end||bytes.readUInt32LE(position)!==0x02014b50)reject();
    const flags=bytes.readUInt16LE(position+8),method=bytes.readUInt16LE(position+10),compressed=bytes.readUInt32LE(position+20),size=bytes.readUInt32LE(position+24);
    const nameSize=bytes.readUInt16LE(position+28),extraSize=bytes.readUInt16LE(position+30),commentSize=bytes.readUInt16LE(position+32),offset=bytes.readUInt32LE(position+42);
    if(flags&~0x0808||![0,8].includes(method)||bytes.readUInt16LE(position+34)||!nameSize||nameSize>240||position+46+nameSize+extraSize+commentSize>end)reject();
    const nameBytes=bytes.subarray(position+46,position+46+nameSize),name=utf8.decode(nameBytes),lower=name.toLowerCase();
    if(!/^[a-zA-Z0-9_\[\]./ -]+$/.test(name)||name.startsWith('/')||name.split('/').some(p=>p==='.'||p==='..')||names.has(lower))reject();
    if(/(?:vbaproject|activex|embeddings|externallinks|macrosheets|dialogsheets)/i.test(name)||(!name.endsWith('/')&&!/\.(xml|rels|png|jpe?g)$/i.test(name)))reject();
    names.add(lower);
    total+=size;
    if(size>4*1024*1024||total>8*1024*1024||size>Math.max(1024,compressed*200)||offset<localEnd||offset+30>directory||bytes.readUInt32LE(offset)!==0x04034b50)reject();
    const localName=bytes.readUInt16LE(offset+26),localExtra=bytes.readUInt16LE(offset+28),start=offset+30+localName+localExtra,finish=start+compressed;
    if(bytes.readUInt16LE(offset+6)!==flags||bytes.readUInt16LE(offset+8)!==method||localName!==nameSize||!bytes.subarray(offset+30,offset+30+localName).equals(nameBytes)||finish>directory)reject();
    if(!(flags&8)&&(bytes.readUInt32LE(offset+18)!==compressed||bytes.readUInt32LE(offset+22)!==size||bytes.readUInt32LE(offset+14)!==bytes.readUInt32LE(position+16)))reject();
    localEnd=finish;
    if(flags&8){
      const descriptor=bytes.readUInt32LE(finish)===0x08074b50?finish+4:finish;
      if(descriptor+12>directory||bytes.readUInt32LE(descriptor)!==bytes.readUInt32LE(position+16)||bytes.readUInt32LE(descriptor+4)!==compressed||bytes.readUInt32LE(descriptor+8)!==size)reject();
      localEnd=descriptor+12;
    }
    const raw=method===0?bytes.subarray(start,finish):inflateRawSync(bytes.subarray(start,finish),{maxOutputLength:Math.max(1,size)});
    if(raw.length!==size)reject();
    if(/\.(xml|rels)$/i.test(name)){
      const value=utf8.decode(raw).replace(/&#(?:x([a-f0-9]+)|(\d+));/gi,(_,hex,decimal)=>String.fromCodePoint(parseInt(hex??decimal,hex?16:10)));
      if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)||/<!DOCTYPE|<!ENTITY|TargetMode\s*=\s*["']External["']|macroEnabled|vbaProject|oleObject|externalLink|embeddedPackage/i.test(value))reject();
      xml.set(lower,value);
    }
    position+=46+nameSize+extraSize+commentSize;
  }
  if(position!==end||localEnd!==directory||!xml.has('_rels/.rels')||!xml.has('xl/workbook.xml')||![...names].some(name=>/^xl\/worksheets\/[^/]+\.xml$/.test(name))||!xml.get('[content_types].xml')?.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml'))reject();
}

export function validatePdf(bytes:Buffer){
  const text=bytes.toString('latin1');
  if(!/^%PDF-(?:1\.[0-7]|2\.0)(?:\r|\n)/.test(text)||! /%%EOF\s*$/.test(text))reject();
  // Reject advertised active/encrypted features, including escaped PDF names.
  // Compressed/obfuscated content can still contain threats: raw PDFs stay unscanned.
  const names=text.replace(/#([a-f0-9]{2})/gi,(_,hex)=>String.fromCharCode(parseInt(hex,16)));
  if(/\/(?:Encrypt|JavaScript|JS|Launch|EmbeddedFile|OpenAction|AA|RichMedia|XFA|SubmitForm|ImportData)\b/.test(names))reject();
}
