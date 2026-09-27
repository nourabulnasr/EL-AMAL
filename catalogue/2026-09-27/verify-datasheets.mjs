/** Verify official WIKA PDF downloads without any package installation.
 * Run: node catalogue/2026-09-27/verify-datasheets.mjs
 * Next run the generated evidence-directory extract-text.py with Python/pypdf,
 * then rerun with --inspect-only. PDF extraction is separate for Windows sandbox compatibility.
 * Cached evidence retains its original HTTP verification date; --refresh refetches.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const evidenceDir = path.join(root, 'docs/source/wika-2026-09-27/datasheets');
const catalogueUrl = 'https://microsites.wika.com/upload/BR_ProductPortfolio_en_co_6434.pdf';
const index = JSON.parse(await fs.readFile(path.join(here, 'page-index.json'), 'utf8'));
const extracted = JSON.parse(await fs.readFile(path.join(here, 'official-extraction.json'), 'utf8'));
const normalizeCode = s => s.replace(/\s/g, '').toUpperCase();
const pdfName = code => `ds_${code.toLowerCase().replace(/[^a-z0-9]/g, '')}_en_co.pdf`;
const cards = index.pages.flatMap(p => p.cards.map(([model, description, printed]) => ({
  model, description, sourceId: p.sourceId,
  cataloguePage: extracted.find(r => r.model === model && r.sourceId === p.sourceId)?.page || p.page,
  printedDatasheetIds: printed,
  codes: printed.split(';').map(normalizeCode).filter(Boolean),
})));
// The source brochure prints TE76.18 for TFT35 and PV32.22 for BA. Current
// manufacturer documents identify those exact models as TE67.18 and PV32.21.
const corrections = { 'TE76.18': 'TE67.18', 'PV32.22': 'PV32.21' };
const correctionEvidence = [
  { model: 'TFT35', printedCode: 'TE76.18', verifiedCode: 'TE67.18',
    sourceUrl: 'https://www.wika.com/media/Data-sheets/Temperature/Resistance-thermometers/ds_te6718_en_co.pdf',
    note: 'The catalogue itself prints TE76.18. The exact TFT35 model is identified in official TE67.18.' },
  { model: 'BA', printedCode: 'PV32.22', verifiedCode: 'PV32.21',
    sourceUrl: 'https://www.wika.com/en-us/ba_bax.WIKA',
    note: 'The catalogue prints PV32.22. The current official BA/BAX product page links PV32.21, verified for BA.' },
];
const exceptions = {
  'PV11.03': {
    kind: 'manufacturer-document-code-mismatch',
    sourceUrl: 'https://www.wika.com/en-us/pgt21.WIKA',
    note: 'The official PGT21 product page links Data sheet PV11.03 to ds_pv1103_en_co.pdf. The downloaded May2026 PDF describes and names PGT21 but prints PV21.02 in its headers and footers. Model and official link are verified; the printed-code check is false.',
  },
};
for (const card of cards) {
  card.codes = card.codes.map(code => corrections[code] || code);
  if (card.model === 'IR80') card.codes = ['AC80.22'];
}
const byCode = {};
for (const card of cards) for (const code of card.codes) {
  byCode[code] ||= { code, models: [] };
  byCode[code].models.push(card.model);
}

// Candidate paths are never published unless the download and document identity validate.
function folders(code) {
  if (/^PV[12]/.test(code)) return [code.startsWith('PV1') ? 'Pressure/Pressure-gauges-with-output-signal' : 'Pressure/Contact-pressure-gauges'];
  if (/^PV3/.test(code)) return ['Pressure/Pressure-switches'];
  if (/^PE/.test(code)) return ['Pressure/Pressure-sensors', 'Pressure/Pressure-switches'];
  if (/^DS/.test(code)) return ['Pressure/Diaphragm-seal-systems'];
  if (/^AC09/.test(code)) return ['Pressure/Valves-and-protective-devices'];
  if (code === 'AC08.04' || code === 'AC80.07') return ['Pressure/Electrical-accessories'];
  if (/^AC85/.test(code)) return ['Temperature/Temperature-controllers'];
  if (['AC80.19', 'AC80.22'].includes(code)) return ['Temperature/Accessories'];
  if (/^AC80/.test(code) || code === 'TE85.01') return ['Temperature/Digital-indicators'];
  if (/^TV[123]/.test(code)) return [code.startsWith('TV3') ? 'Temperature/Temperature-switches' : 'Temperature/Thermometers-with-switch-contacts'];
  if (code === 'TE62.01') return ['Temperature/Digital-indicators'];
  if (/^TE(15|16|32|38|91)/.test(code)) return ['Temperature/Temperature-transmitters'];
  if (code === 'TE67.03') return ['Temperature/Temperature-switches'];
  if (code === 'TE70.11') return ['Temperature/Resistance-thermometers'];
  if (/^TE70/.test(code)) return ['Temperature/Multipoint-thermometers'];
  if (/^TE64/.test(code)) return ['Temperature/Engineered-solutions-temperature'];
  if (['TE65.59', 'TE65.60'].includes(code)) return ['Temperature/Tubeskin-thermocouples'];
  if (code === 'TE67.20') return ['Temperature/Thermocouples'];
  if (/^TE65/.test(code)) return ['Temperature/Thermocouples', 'Temperature/Engineered-solutions-temperature'];
  if (/^TE(60|67)/.test(code)) return ['Temperature/Resistance-thermometers'];
  return [];
}
const specificUrls = {};
const readPdf = file => JSON.parse(readFileSync(`${file}.text.json`, 'utf8'));
const clean = text => text.toUpperCase().replace(/[\u2010-\u2015\u2212]/g, '-').replace(/\s+/g, ' ');
function inspectPdf(file, entry) {
  const pdf = readPdf(file);
  const firstPagesText = pdf.pageTexts.slice(0, 3).join('\n');
  const codeMatches = normalizeCode(firstPagesText).includes(entry.code);
  const expected = [...new Set(entry.models.flatMap(m => m.replace(/ with 8xx/g, '').split(',').map(s => s.trim())))];
  const modelChecks = expected.map(model => {
    const aliases = ({ IBM: ['IBM', 'IBM2', 'IBM3'], IBF: ['IBF', 'IBF2', 'IBF3'] })[model] || [model];
    const matchedModels = aliases.filter(alias => {
      const re = new RegExp(`(^|[^A-Z0-9])${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^A-Z0-9]|$)`);
      return pdf.pageTexts.some(t => re.test(clean(t)));
    });
    const pageIndex = pdf.pageTexts.findIndex(t => matchedModels.some(alias => clean(t).includes(alias)));
    return { model, found: pageIndex >= 0, page: pageIndex >= 0 ? pageIndex + 1 : null, matchedModels,
      ...(aliases.length > 1 ? { familyNote: 'Catalogue family name; current datasheet identifies these numbered family variants.' } : {}) };
  });
  return { pageCount: pdf.pages, codeMatchesFirstThreePages: codeMatches,
    firstPageSummary: pdf.pageTexts[0].split('\n').filter(Boolean).slice(0, 18).join(' ').slice(0, 1500), modelChecks };
}
await fs.mkdir(evidenceDir, { recursive: true });
await fs.writeFile(path.join(evidenceDir, 'extract-text.py'), `from pathlib import Path
import json
from pypdf import PdfReader
for f in Path(__file__).parent.glob('*.pdf'):
    dest = Path(str(f) + '.text.json')
    if dest.exists() and dest.stat().st_mtime >= f.stat().st_mtime:
        continue
    reader = PdfReader(f)
    dest.write_text(json.dumps({'pages': len(reader.pages), 'pageTexts': [p.extract_text() or '' for p in reader.pages]}, ensure_ascii=False), encoding='utf-8')
print('Extracted PDF evidence text')
`);
let previous = {};
try { previous = JSON.parse(await fs.readFile(path.join(here, 'datasheet-links.json'), 'utf8')).byCode; } catch {}
async function verify(entry) {
  const pdfFile = path.join(evidenceDir, pdfName(entry.code));
  const metadataFile = `${pdfFile}.json`;
  let cached;
  try { cached = JSON.parse(await fs.readFile(metadataFile, 'utf8')); } catch {}
  // Recover HTTP evidence from an interrupted earlier extraction without fetching again.
  if (!cached && existsSync(pdfFile)) {
    const attempt = previous[entry.code]?.attempts?.find(a => a.httpStatus === 200 && a.isPdf);
    if (attempt) {
      const bytes = await fs.readFile(pdfFile);
      cached = { ...attempt, verifiedAt: '2026-09-27', bytes: bytes.length,
        sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
        localFile: path.relative(root, pdfFile).replaceAll('\\', '/'), status: 'awaiting-text-inspection' };
      await fs.writeFile(metadataFile, JSON.stringify(cached, null, 2));
    }
  }
  if (cached?.httpStatus === 200 && !process.argv.includes('--refresh')) {
    const bytes = await fs.readFile(pdfFile);
    if (crypto.createHash('sha256').update(bytes).digest('hex') === cached.sha256) {
      Object.assign(entry, cached);
      entry.status = 'awaiting-text-inspection';
      if (existsSync(`${pdfFile}.text.json`) && statSync(`${pdfFile}.text.json`).mtimeMs >= statSync(pdfFile).mtimeMs) {
        Object.assign(entry, inspectPdf(pdfFile, entry));
        entry.status = entry.codeMatchesFirstThreePages && entry.modelChecks.some(m => m.found) ? 'verified' : 'identity-review-needed';
      }
      return;
    }
  }
  entry.attempts = [];
  if (process.argv.includes('--inspect-only')) { entry.status = 'unresolved'; return; }
  const urls = specificUrls[entry.code] || folders(entry.code).map(folder => `https://www.wika.com/media/Data-sheets/${folder}/${pdfName(entry.code)}`);
  for (const url of urls) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(45000), redirect: 'follow' });
      const finalUrl = new URL(response.url);
      if (finalUrl.protocol !== 'https:' || !/(^|\.)wika\.(com|de)$/.test(finalUrl.hostname)) throw new Error('Not an official HTTPS WIKA destination');
      const bytes = Buffer.from(await response.arrayBuffer());
      const isPdf = bytes.subarray(0, 5).toString() === '%PDF-';
      const attempt = { url, finalUrl: response.url, httpStatus: response.status, contentType: response.headers.get('content-type'), isPdf };
      entry.attempts.push(attempt);
      if (response.status !== 200 || !isPdf) continue;
      await fs.writeFile(pdfFile, bytes);
      Object.assign(entry, attempt, {
        verifiedAt: new Date().toISOString(), bytes: bytes.length,
        sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
        localFile: path.relative(root, pdfFile).replaceAll('\\', '/'),
      });
      entry.status = 'awaiting-text-inspection';
      await fs.writeFile(metadataFile, `${JSON.stringify(entry, null, 2)}\n`);
      console.log(`${entry.code}: ${entry.status}`);
      return;
    } catch (error) { entry.attempts.push({ url, error: error.message }); }
  }
  entry.status = 'unresolved';
  console.log(`${entry.code}: unresolved`);
}
const queue = Object.values(byCode);
let next = 0;
await Promise.all(Array.from({ length: 3 }, async () => { while (next < queue.length) await verify(queue[next++]); }));
for (const [code, exception] of Object.entries(exceptions)) {
  const entry = byCode[code];
  if (entry?.httpStatus === 200 && entry.isPdf && entry.modelChecks?.some(m => m.found) && !entry.codeMatchesFirstThreePages) {
    entry.status = 'verified-official-link-code-mismatch';
    entry.exception = exception;
  }
}
const isLinked = code => byCode[code]?.status.startsWith('verified');
for (const card of cards) {
  card.documents = card.codes.filter(isLinked).map(code => ({ code, url: byCode[code].url,
    title: code === 'PV11.03' ? 'WIKA PGT21' : `WIKA ${code.replace(/^([A-Z]+)(\d)/, '$1 $2')}`,
    ...(byCode[code].exception ? { sourceNote: byCode[code].exception.note } : {}) }));
  card.unresolvedCodes = card.codes.filter(code => !isLinked(code));
  card.catalogueUrl = `${catalogueUrl}#page=${card.cataloguePage}`;
  card.status = card.documents.length && card.unresolvedCodes.length === 0 ? (card.codes.some(code => byCode[code].exception) ? 'verified-official-link-with-source-note' : 'verified-datasheets') : 'catalogue-fallback';
  if (!card.codes.length) card.fallbackReason = 'No dedicated datasheet identifier is printed for this cable family; no exact orderable part number is inferred.';
}
const report = {
  verifiedAt: new Date().toISOString(), source: 'Official WIKA HTTPS downloads',
  verificationPolicy: 'HTTP 200, %PDF- signature, SHA-256, printed code in first three pages, and model identity in document text. A manufacturer-linked model PDF with an inconsistent printed code is separately labelled verified-official-link-code-mismatch and carries an exception. Family cards may require several datasheets; page-level modelChecks disclose where each model appears. Catalogue fallback is a catalogue, not a standalone datasheet.',
  corrections, correctionEvidence, catalogueUrl,
  counts: { cards: cards.length, codes: queue.length, verifiedCodes: queue.filter(e => e.status === 'verified').length,
    officialLinkCodeMismatches: queue.filter(e => e.status === 'verified-official-link-code-mismatch').length,
    unresolvedCodes: queue.filter(e => !e.status.startsWith('verified')).length,
    cardsWithCompleteDatasheets: cards.filter(c => c.status === 'verified-datasheets').length,
    cardsWithOfficialDatasheetLinks: cards.filter(c => c.status.startsWith('verified')).length },
  byCode, cards,
};
await fs.writeFile(path.join(here, 'datasheet-links.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.counts));
