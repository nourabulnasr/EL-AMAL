// Read-only checks for this intake. Run from any working directory; no DB or network access.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateImport} from '../../src/lib/import.ts';

const directory = fileURLToPath(new URL('.', import.meta.url));
const repository = resolve(directory, '../..');
const readJSON = name => JSON.parse(readFileSync(resolve(directory, name), 'utf8'));
const manifest = readJSON('source-manifest.json');
const index = readJSON('page-index.json');
const products = readJSON('pilot-products.json');
const reviews = readJSON('pilot-review.json');
const normalizeReference = value => value.replaceAll(' ', '').toUpperCase();
const sourceIds = new Set(), hashes = new Set(), indexedSources = new Set(), modelGroups = new Set();
let inStockCards = 0, outOfStockCards = 0;

assert.equal(manifest.images.length, 29);
assert.equal(manifest.stockClassificationConfirmation, 'Every model on the main page');
assert.equal(manifest.images.filter(image => image.folderClassification === 'in-stock').length, 17);
assert.equal(manifest.images.filter(image => image.folderClassification === 'out-of-stock').length, 12);
for (const source of manifest.images) {
  assert(!sourceIds.has(source.sourceId), 'Duplicate source ID');
  assert(!hashes.has(source.sha256), 'Duplicate source image');
  sourceIds.add(source.sourceId);
  hashes.add(source.sha256);
  assert(['in-stock', 'out-of-stock'].includes(source.folderClassification));
  const copyPath = resolve(repository, source.localPath);
  const sourceRoot = resolve(repository, 'docs/source/catalogue-2026-09-27');
  assert(copyPath.startsWith(sourceRoot + sep), 'Source path escaped the intake directory');
  const bytes = readFileSync(copyPath);
  assert.equal(bytes.length, source.bytes, source.sourceId + ' size changed');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.sourceId + ' hash changed');
}
for (const page of index.pages) {
  assert(sourceIds.has(page.sourceId), 'Unmatched source page');
  assert(!indexedSources.has(page.sourceId), 'Duplicate indexed page');
  indexedSources.add(page.sourceId);
  assert(page.page === null || (Number.isSafeInteger(page.page) && page.page > 0));
  const source = manifest.images.find(image => image.sourceId === page.sourceId);
  for (const card of page.cards) {
    assert.equal(card.length, 3);
    assert(card.every(value => typeof value === 'string'));
    assert(card[0].trim() && card[1].trim());
    assert(!modelGroups.has(card[0]), 'Repeated model group: ' + card[0]);
    modelGroups.add(card[0]);
    if (source.folderClassification === 'in-stock') inStockCards++;
    else outOfStockCards++;
  }
}
assert.deepEqual(indexedSources, sourceIds);
assert.equal(inStockCards, 90);
assert.equal(outOfStockCards, 61);
assert.deepEqual(index.counts, {pages: 29, cards: 151, inStockCards: 90, outOfStockCards: 61});
assert.equal(products.length, 10);
assert.equal(reviews.length, 10);
assert.deepEqual(validateImport(products, [], ['pressure', 'temperature', 'accessories']), []);
assert.equal(new Set(reviews.map(review => review.model)).size, 10);
for (const product of products) {
  assert.equal(product.review_status, 'draft');
  assert(/[\u0600-\u06FF]/.test(product.name_ar) && /[\u0600-\u06FF]/.test(product.description_ar));
  const review = reviews.find(entry => entry.model === product.model);
  assert(review, 'Missing pilot review');
  assert.equal(review.rightsConfirmed, false);
  assert.equal(review.publicationStatus, 'draft');
  assert.equal(review.technicalReviewStatus, 'pending');
  const page = index.pages.find(entry => entry.sourceId === review.sourceId);
  const card = page.cards.find(entry => entry[0] === product.model);
  assert(card, 'Pilot model absent from main page');
  const source = manifest.images.find(image => image.sourceId === review.sourceId);
  assert.equal(review.userReportedAvailability, source.folderClassification);
  assert(product.source_ref.includes(source.sha256));
  assert.deepEqual(review.printedDatasheetIds.map(normalizeReference), card[2].split(';').map(normalizeReference));
  for (const link of [review.manufacturerPageUrl, review.datasheetUrl]) {
    const url = new URL(link);
    assert.equal(url.protocol, 'https:');
    assert.equal(url.hostname, 'www.wika.com');
  }
  assert(review.datasheetUrl.endsWith('.pdf'));
}
console.log(JSON.stringify({
  sourceCopiesVerified: sourceIds.size,
  indexedMainPages: indexedSources.size,
  productCardsOrGroups: modelGroups.size,
  inStockCards, outOfStockCards,
  bilingualDraftRowsValidated: products.length,
  skuRows: 0,
  databaseWrites: 0,
  scope: 'Structural validation and source-copy integrity; not technical, translation or publication approval.'
}, null, 2));
