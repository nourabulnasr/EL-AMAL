// Read-only reconciliation: original photos -> index -> public API -> public pages/assets.
// No environment files, authentication, database client or mutating HTTP methods are used.
import {readFile, readdir, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {resolveStreamedCard} from './lib/catalogue-audit-html.mjs';

const root = process.cwd();
const origin = 'https://el-amal-sigma.vercel.app';
const intake = 'catalogue/2026-09-27';
const out = process.argv[2] || 'artifacts/2026-10-07/catalogue-coverage';
const readJson = async file => JSON.parse(await readFile(path.join(root, file), 'utf8'));
const [manifest, index, publication] = await Promise.all([
  readJson(`${intake}/source-manifest.json`), readJson(`${intake}/page-index.json`),
  readJson(`${intake}/publication.json`),
]);
const report = {startedAt: new Date().toISOString(), origin, issues: [], sources: [], products: [], listings: [], searches: []};
const issue = (scope, message) => report.issues.push({scope, message});
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const decode = value => value.replace(/&#x([a-f0-9]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const plain = value => decode(value.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
const body = html => html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');
const stockLabel = (availability, locale) => locale === 'en'
  ? (availability === 'in-stock' ? 'In stock' : 'Out of stock')
  : (availability === 'in-stock' ? 'متوفر' : 'غير متوفر');
const availabilityText = html => plain(html.match(/<p class="availability dated-availability">[\s\S]*?<strong>([\s\S]*?)<\/strong>/)?.[1] || '');
async function get(url) {
  const target = new URL(url, origin);
  if (target.origin !== origin) throw new Error('Only the public EL AMAL origin may be fetched.');
  return fetch(target, {signal: AbortSignal.timeout(45000), headers: {'user-agent': 'EL-AMAL-Catalogue-Coverage-Audit/1.0'}, redirect: 'error'});
}
async function pool(items, worker) {
  let cursor = 0;
  await Promise.all(Array.from({length: 3}, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      await worker(item);
    }
  }));
}
async function filesBelow(dir) {
  const entries = await readdir(dir, {withFileTypes: true});
  const groups = await Promise.all(entries.map(async entry => entry.isDirectory()
    ? filesBelow(path.join(dir, entry.name)) : [path.join(dir, entry.name)]));
  return groups.flat();
}
const folders = {
  'in-stock': path.join(process.env.USERPROFILE, 'OneDrive/Desktop/In Stock products'),
  'out-of-stock': path.join(process.env.USERPROFILE, 'OneDrive/Desktop/out of stockk prodcuts'),
};
for (const [stock, folder] of Object.entries(folders)) {
  const originals = (await filesBelow(folder)).filter(file => /\.(jpe?g|png|webp|heic|pdf)$/i.test(file));
  const expected = manifest.images.filter(image => image.folderClassification === stock);
  if (originals.length !== expected.length) issue(stock, `Source file count ${originals.length} differs from ${expected.length}`);
  for (const original of originals) {
    if (!expected.some(image => path.resolve(folder, image.filename) === path.resolve(original))) issue(stock, `Unindexed source: ${path.basename(original)}`);
  }
  for (const image of expected) {
    const result = {sourceId: image.sourceId, filename: image.filename, availability: stock, hashMatches: false};
    try {
      const [original, copy] = await Promise.all([readFile(path.join(folder, image.filename)), readFile(path.join(root, image.localPath))]);
      result.hashMatches = sha(original) === image.sha256 && sha(copy) === image.sha256;
      if (!result.hashMatches) issue(image.sourceId, 'Original/copy SHA-256 mismatch');
    } catch (error) { issue(image.sourceId, error.message); }
    report.sources.push(result);
  }
}
const expectedProducts = index.pages.flatMap(page => page.cards.map(([model]) => ({
  model, sourceId: page.sourceId, availability: manifest.images.find(image => image.sourceId === page.sourceId)?.folderClassification,
})));
if (new Set(expectedProducts.map(product => product.model)).size !== expectedProducts.length) issue('index', 'Duplicate model heading');
for (const product of publication.products) {
  if (!expectedProducts.some(expected => expected.model === product.model)) issue(product.model, 'Publication model has no photographed main-page card');
}
const live = [];
let nextPage = 1;
const visitedPages = new Set();
let reportedTotal;
while (nextPage) {
  if (visitedPages.has(nextPage) || visitedPages.size > 100) throw new Error('API pagination loop');
  visitedPages.add(nextPage);
  const response = await get(`/api/products?limit=200&depth=0&page=${nextPage}`);
  if (!response.ok) throw new Error(`Public API returned ${response.status}`);
  const data = await response.json();
  live.push(...data.docs);
  reportedTotal = data.totalDocs;
  nextPage = data.hasNextPage ? data.nextPage : null;
}
if (live.length !== reportedTotal) issue('api', 'API total does not match fetched records');
if (new Set(live.map(product => product.id)).size !== live.length) issue('api', 'Duplicate record IDs');
for (const product of live) {
  if (!expectedProducts.some(expected => expected.model === product.model)) issue(product.model, 'Unexpected live product');
}
for (const expected of expectedProducts) {
  const matches = live.filter(product => product.model === expected.model);
  const prepared = publication.products.filter(product => product.model === expected.model);
  const item = {...expected, id: matches[0]?.id, apiMatches: true, pages: [], image: null};
  report.products.push(item);
  if (matches.length !== 1 || prepared.length !== 1) {
    item.apiMatches = false;
    issue(expected.model, `Expected one publication/live match; found ${prepared.length}/${matches.length}`);
    continue;
  }
  const product = matches[0], source = prepared[0];
  const publicFields = ['externalId', 'model', 'name', 'description', 'instrumentType', 'applications', 'datasheetUrl', 'catalogueDetails'];
  for (const field of publicFields) {
    if (!isDeepStrictEqual(product[field], source[field])) { item.apiMatches = false; issue(expected.model, `Public field differs: ${field}`); }
  }
  if (product._status !== 'published') issue(expected.model, 'Record is not published');
  if (product.catalogueDetails?.availability !== expected.availability) issue(expected.model, 'Stock label differs from source folder');
}
console.log(`Sources checked: ${report.sources.length}. API records: ${live.length}. Checking all public pages and image bytes.`);
let completed = 0;
await pool(report.products.filter(item => item.id), async item => {
  const product = live.find(product => product.id === item.id);
  const details = product.catalogueDetails;
  for (const locale of ['en', 'ar']) {
    const url = `${origin}/${locale}/products/cms-${item.id}`;
    const result = {locale, url, status: null, model: false, name: false, availability: false, date: false, image: false, specifications: false, datasheets: false};
    item.pages.push(result);
    try {
      const response = await get(url); result.status = response.status;
      const html = body(await response.text());
      result.model = plain(html.match(/<p class="model">([\s\S]*?)<\/p>/)?.[1] || '') === item.model;
      result.name = plain(html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] || '') === plain(product.name[locale]);
      result.availability = availabilityText(html) === stockLabel(item.availability, locale);
      result.date = html.includes(`dateTime="${details.availabilityReportedAt}"`) || html.includes(`datetime="${details.availabilityReportedAt}"`);
      result.image = [...html.matchAll(/<img\b[^>]*class="manufacturer-image"[^>]*>/g)].some(([tag]) =>
        decodeURIComponent(decode(tag)).includes(details.image.src));
      const technical = html.match(/<section class="technical-section">([\s\S]*?)<\/section>/)?.[1] || '';
      const rows = [...technical.matchAll(/<dt>([\s\S]*?)<\/dt><dd>([\s\S]*?)<\/dd>/g)].map(([, label, value]) => [plain(label), plain(value)]);
      result.specifications = details.specifications.length > 0 && details.specifications.every(spec =>
        rows.some(([label, value]) => label === plain(spec.label[locale]) && value === plain(spec.value[locale])));
      result.datasheets = details.datasheets.length > 0 && details.datasheets.every(sheet => decode(technical).includes(`href="${sheet.url}"`));
      if (result.status !== 200) issue(url, `HTTP ${result.status}`);
      for (const [check, okay] of Object.entries(result)) if (okay === false) issue(url, `Rendered ${check} mismatch`);
    } catch (error) { issue(url, error.message); }
  }
  try {
    const response = await get(details.image.src);
    const online = Buffer.from(await response.arrayBuffer());
    const local = await readFile(path.join(root, 'public', details.image.src));
    item.image = {src: details.image.src, status: response.status, sha256: sha(online), matchesLocal: sha(online) === sha(local)};
    if (response.status !== 200 || !item.image.matchesLocal) issue(item.model, 'Live image bytes differ or failed');
  } catch (error) { issue(item.model, `Image check: ${error.message}`); }
  if (++completed % 25 === 0) console.log(`Checked ${completed}/${report.products.length} models.`);
});
function inspectCards(html, locale, scope) {
  const cards = [...body(html).matchAll(/<article class="product-card">([\s\S]*?)<\/article>/g)];
  return cards.map(([, rawCard]) => {
    const card = resolveStreamedCard(rawCard, html);
    const id = Number(card.match(new RegExp(`href="/${locale}/products/cms-(\\d+)"`))?.[1]);
    const expected = report.products.find(product => product.id === id);
    const model = plain(card.match(/<bdi class="model">([\s\S]*?)<\/bdi>/)?.[1] || '');
    if (!expected || model !== expected.model || availabilityText(card) !== stockLabel(expected.availability, locale)) issue(scope, `Incorrect card: ${id}/${model}`);
    return id;
  });
}
for (const locale of ['en', 'ar']) {
  const listed = [];
  for (let page = 1; page <= Math.ceil(expectedProducts.length / 24); page++) {
    const url = `${origin}/${locale}/products${page === 1 ? '' : `?page=${page}`}`;
    try {
      const response = await get(url);
      const ids = inspectCards(await response.text(), locale, url);
      report.listings.push({locale, page, status: response.status, ids}); listed.push(...ids);
      if (response.status !== 200) issue(url, `Listing HTTP ${response.status}`);
    } catch (error) { issue(url, error.message); }
  }
  if (listed.length !== expectedProducts.length || new Set(listed).size !== expectedProducts.length) issue(locale, 'Catalogue pagination contains missing or duplicate entries');
  for (const item of report.products) if (!listed.includes(item.id)) issue(item.model, `Not listed in ${locale}`);
  for (const query of ['DIH52', 'PGS23.160']) {
    const url = `${origin}/${locale}/products?q=${encodeURIComponent(query)}`;
    try {
      const response = await get(url);
      const ids = inspectCards(await response.text(), locale, url);
      const expected = report.products.find(item => item.model.includes(query));
      const found = ids.includes(expected?.id);
      report.searches.push({locale, query, status: response.status, found});
      if (response.status !== 200 || !found) issue(url, 'Grouped model search missing');
    } catch (error) { issue(url, error.message); }
  }
}
report.finishedAt = new Date().toISOString();
report.summary = {
  sourcePhotos: report.sources.length, expectedEntries: expectedProducts.length, publicApiEntries: live.length,
  inStock: report.products.filter(item => item.availability === 'in-stock').length,
  outOfStock: report.products.filter(item => item.availability === 'out-of-stock').length,
  detailPages: report.products.flatMap(item => item.pages).length,
  listingPages: report.listings.length, images: report.products.filter(item => item.image?.matchesLocal).length,
  issues: report.issues.length,
};
await mkdir(path.join(root, out), {recursive: true});
await writeFile(path.join(root, out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.summary, null, 2));
if (report.issues.length) { console.log(JSON.stringify(report.issues.slice(0, 20), null, 2)); process.exitCode = 1; }
