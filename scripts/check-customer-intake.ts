import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getPayload } from "payload";
import config from "../src/payload.config.ts";
import { reserveEmailAttempt } from "../src/lib/customer-quota.ts";
import {
  emailLimitKey,
  attemptLimitKey,
  createReceipt,
  readReceipt,
} from "../src/lib/customer-receipt.ts";
import {
  submitCustomerEnquiry,
  resendCustomerEnquiry,
} from "../src/lib/customer-service.ts";
import { CustomerLimitError } from "../src/lib/customer-http.ts";
import { EnquiryConflictError } from "../src/lib/enquiries.ts";
import { openMessage } from "../src/lib/verification-message.ts";
import { confirmVerification } from "../src/lib/enquiry-verification.ts";
if (process.env.CMS_DATABASE_CHECK !== "development")
  throw new Error("Development database only");
const payload = await getPayload({ config }),
  pool = payload.db.pool;
const settings = {
  secret: process.env.PAYLOAD_SECRET!,
  origin: "https://example.invalid",
  from: "sender@example.invalid",
};
const catalogue = { source: "cms" as const, categories: [], products: [] };
const run = randomUUID(),
  email = `customer-${run}@example.invalid`,
  keys = Array.from({ length: 10 }, () => randomUUID()),
  quotaKeys = new Set<string>();
const keyFor = (mail: string, attempt?: string) => {
  const key = attempt
    ? attemptLimitKey(mail, attempt, settings.secret)
    : emailLimitKey(mail, settings.secret);
  quotaKeys.add(key);
  return key;
};
const input = {
  locale: "en",
  contact: {
    name: "Customer intake test",
    company: "Disposable test",
    email,
    notes: "",
  },
  lines: [],
  manual: { model: "TEST", quantity: 1, range: "0-10 bar" },
};
const row = async (reference: string) =>
  (
    await pool.query("SELECT * FROM verification_emails WHERE reference=$1", [
      reference,
    ])
  ).rows[0];
const token = (message: { text: string }) => message.text.split("#token=")[1];
try {
  const quotaEmail = `quota-${run}@example.invalid`,
    emailKey = keyFor(quotaEmail),
    attempts = Array.from({ length: 12 }, (_, i) =>
      keyFor(quotaEmail, `attempt-${i}`),
    );
  const results = await Promise.all(
    attempts.map((attempt) => reserveEmailAttempt(payload, emailKey, attempt)),
  );
  assert.equal(
    results.filter(Boolean).length,
    6,
    "Concurrent different attempts never exceed email quota",
  );
  assert.equal(
    Number(
      (
        await pool.query("SELECT hits FROM request_limits WHERE key=$1", [
          emailKey,
        ])
      ).rows[0].hits,
    ),
    6,
  );
  const accepted = attempts[results.findIndex(Boolean)];
  assert.equal(
    await reserveEmailAttempt(payload, emailKey, accepted),
    true,
    "Same attempt is allowed even after quota is full",
  );
  await pool.query(
    "UPDATE request_limits SET window_ends_at=now()-interval '1 second' WHERE key=ANY($1::text[])",
    [[emailKey, ...attempts]],
  );
  const repeats = await Promise.all(
    Array.from({ length: 8 }, () =>
      reserveEmailAttempt(payload, emailKey, accepted),
    ),
  );
  assert.equal(repeats.every(Boolean), true);
  assert.equal(
    Number(
      (
        await pool.query("SELECT hits FROM request_limits WHERE key=$1", [
          emailKey,
        ])
      ).rows[0].hits,
    ),
    1,
    "Expired quota resets; simultaneous identical retries charge once",
  );
  await assert.rejects(reserveEmailAttempt(payload, emailKey, emailKey));
  await assert.rejects(
    submitCustomerEnquiry(
      payload,
      { ...input, requestKey: keys[0] },
      { ...catalogue, source: "demo" },
      settings,
    ),
  );
  assert.equal(
    (
      await pool.query("SELECT id FROM enquiries WHERE request_key=$1", [
        keys[0],
      ])
    ).rowCount,
    0,
  );
  keyFor(email);
  keyFor(email, `submit:${keys[1]}`);
  const submissions = await Promise.all([
    submitCustomerEnquiry(
      payload,
      { ...input, requestKey: keys[1] },
      catalogue,
      settings,
    ),
    submitCustomerEnquiry(
      payload,
      {
        ...input,
        contact: { ...input.contact, email: email.toUpperCase() },
        requestKey: keys[1],
      },
      catalogue,
      settings,
    ),
  ]);
  assert.equal(
    submissions[0].reference,
    submissions[1].reference,
    "Case-normalized email and request key deduplicate",
  );
  const reference = submissions[0].reference;
  assert.equal(
    (
      await pool.query("SELECT id FROM enquiries WHERE request_key=$1", [
        keys[1],
      ])
    ).rowCount,
    1,
  );
  assert.equal(
    (
      await pool.query(
        "SELECT id FROM verification_emails WHERE reference=$1",
        [reference],
      )
    ).rowCount,
    1,
  );
  assert.equal(
    Number(
      (
        await pool.query("SELECT hits FROM request_limits WHERE key=$1", [
          keyFor(email),
        ])
      ).rows[0].hits,
    ),
    1,
  );
  await assert.rejects(
    submitCustomerEnquiry(
      payload,
      {
        ...input,
        requestKey: keys[1],
        manual: { ...input.manual, quantity: 2 },
      },
      catalogue,
      settings,
    ),
    EnquiryConflictError,
  );
  let queued = await row(reference);
  const firstToken = token(
    openMessage(queued.sealed_message, settings.secret, queued.delivery_key),
  );
  const receipt = createReceipt(reference, settings.secret);
  assert.equal(readReceipt(receipt, settings.secret), reference);
  await pool.query(
    "UPDATE verification_emails SET last_issued_at=now()-interval '2 minutes' WHERE reference=$1",
    [reference],
  );
  const minute = Math.floor(Date.now() / 60000);
  // Track adjacent minutes for exact cleanup if the call crosses a minute boundary.
  for (const m of [minute - 1, minute, minute + 1])
    keyFor(email, `resend:${reference}:${m}`);
  await Promise.all([
    resendCustomerEnquiry(payload, reference, settings),
    resendCustomerEnquiry(payload, reference, settings),
  ]);
  queued = await row(reference);
  assert.equal(Number(queued.issue_count), 2, "Concurrent resend rotates once");
  assert.equal(
    await confirmVerification(payload, firstToken),
    null,
    "Old verification link cannot confirm",
  );
  const replacement = token(
    openMessage(queued.sealed_message, settings.secret, queued.delivery_key),
  );
  assert.equal(
    (await confirmVerification(payload, replacement))?.mode,
    "customer",
  );
  const hits = Number(
    (
      await pool.query("SELECT hits FROM request_limits WHERE key=$1", [
        keyFor(email),
      ])
    ).rows[0].hits,
  );
  await resendCustomerEnquiry(payload, reference, settings);
  assert.equal(
    Number(
      (
        await pool.query("SELECT hits FROM request_limits WHERE key=$1", [
          keyFor(email),
        ])
      ).rows[0].hits,
    ),
    hits,
    "Confirmed enquiry cannot request more mail",
  );
  for (let i = 0; i < 6 - hits; i++) {
    const key = keys[i + 2];
    keyFor(email, `submit:${key}`);
    await submitCustomerEnquiry(
      payload,
      { ...input, requestKey: key },
      catalogue,
      settings,
    );
  }
  keyFor(email, `submit:${keys[8]}`);
  await assert.rejects(
    submitCustomerEnquiry(
      payload,
      { ...input, requestKey: keys[8] },
      catalogue,
      settings,
    ),
    CustomerLimitError,
  );
  assert.equal(
    (
      await pool.query("SELECT id FROM enquiries WHERE request_key=$1", [
        keys[8],
      ])
    ).rowCount,
    0,
    "Daily limit prevents another saved enquiry and queued email",
  );
  assert.equal(
    (
      await submitCustomerEnquiry(
        payload,
        { ...input, requestKey: keys[1] },
        catalogue,
        settings,
      )
    ).reference,
    reference,
    "Original retry still resolves after quota exhaustion",
  );
  const productEmail = `product-${run}@example.invalid`;
  keyFor(productEmail);
  keyFor(productEmail, `submit:${keys[9]}`);
  const productInput = {
    ...input,
    requestKey: keys[9],
    contact: { ...input.contact, email: productEmail },
    manual: undefined,
    lines: [{ productId: "cms-test", quantity: 1 }],
  };
  const productCatalogue = {
    ...catalogue,
    products: [
      {
        id: "cms-test",
        model: "TEST",
        category: "test",
        name: { en: "Test", ar: "Test" },
        description: { en: "Test", ar: "Test" },
      },
    ],
  };
  const productSaved = await submitCustomerEnquiry(
    payload,
    productInput,
    productCatalogue,
    settings,
  );
  assert.equal(
    (await submitCustomerEnquiry(payload, productInput, catalogue, settings))
      .reference,
    productSaved.reference,
    "Retry resolves saved snapshot after product removal",
  );
  console.log(
    "Customer intake checks succeeded: concurrent daily quota, idempotent allowance, expiry reset, demo exclusion, normalized duplicate submission, conflict rejection, single queued confirmation, resend contention, token rotation, confirmed exclusion and quota denial before persistence. No email transport invoked.",
  );
} finally {
  const records = await payload.find({
    collection: "enquiries",
    overrideAccess: true,
    where: { requestKey: { in: keys } },
    depth: 0,
    limit: 100,
  });
  const ids = records.docs.map((x) => x.id);
  if (ids.length)
    for (const collection of [
      "verification-emails",
      "enquiry-verifications",
      "notifications",
    ] as const)
      await payload.delete({
        collection,
        overrideAccess: true,
        where: { enquiry: { in: ids } },
      });
  await payload.delete({
    collection: "enquiries",
    overrideAccess: true,
    where: { requestKey: { in: keys } },
  });
  await pool.query("DELETE FROM request_limits WHERE key=ANY($1::text[])", [
    [...quotaKeys],
  ]);
  assert.equal(Object.keys(payload.db.sessions ?? {}).length, 0);
  await payload.destroy();
}
console.log("Disposable customer intake records removed.");
process.exit(0);
