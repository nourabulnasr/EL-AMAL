import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  createReceipt,
  readReceipt,
  emailLimitKey,
  attemptLimitKey,
} from "../src/lib/customer-receipt.ts";
import {
  customerHandlers,
  CustomerLimitError,
} from "../src/lib/customer-http.ts";
import { customerSettings,quotationSettings } from "../src/lib/customer-readiness.ts";
const secret = "s".repeat(40),
  reference = `EA-${randomUUID()}`,
  origin = "https://example.test";
const input = {
  requestKey: randomUUID(),
  locale: "en",
  contact: {
    name: "Test",
    email: "test@example.invalid",
    company: "Test",
    notes: "",
  },
  lines: [],
  manual: { model: "X", quantity: 1, range: "0-10 bar" },
};
const request = (body, url = origin, headers = {}) =>
  new Request(url + "/api/customer-enquiries", {
    method: "POST",
    headers: { origin, "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
const base = {
  settings: () => ({ origin, secret }),
  allow: async () => true,
  submit: async () => ({ reference, repeated: false }),
  resend: async () => ({ outcome: "queued" }),
};
test("resend receipts expire, cannot be forged, and disclose no contact details", () => {
  const receipt = createReceipt(reference, secret, 1800000000000);
  assert.equal(readReceipt(receipt, secret, 1800000000001), reference);
  assert.equal(readReceipt(receipt, secret, 1800000000000 + 86400000), null);
  assert.equal(readReceipt(receipt, "x".repeat(40), 1800000000001), null);
  assert.equal(readReceipt(receipt + "x", secret, 1800000000001), null);
  assert.equal(readReceipt("x".repeat(1000), secret, 1800000000001), null);
  assert.throws(() => createReceipt(reference, "short"));
  assert.equal(
    emailLimitKey(" Test@Example.invalid ", secret),
    emailLimitKey("test@example.invalid", secret),
  );
  assert.notEqual(
    emailLimitKey("test@example.invalid", secret),
    attemptLimitKey("test@example.invalid", input.requestKey, secret),
  );
});
test("activation fails closed unless catalogue, sender, worker and public origin are explicit", () => {
  const env = {
    CMS_ENABLED: "true",
    DATABASE_URL: "present",
    PAYLOAD_SECRET: secret,
    CATALOGUE_SOURCE: "cms",
    PUBLIC_ENQUIRIES_ENABLED: "true",
    ENQUIRY_WORKERS_READY: "true",
    VERIFICATION_DELIVERY_ENABLED: "true",
    NOTIFICATION_DELIVERY_ENABLED: "true",
    MAIL_PROVIDER: "resend",
    RESEND_API_KEY: "present",
    MAIL_FROM: "sender@example.invalid",
    NOTIFICATION_WORKER_SECRET: secret,
    SITE_URL: origin,
  };
  assert.ok(customerSettings(env));
  assert.equal(quotationSettings(env),undefined);
  assert.ok(quotationSettings({...env,ENQUIRY_QUOTATIONS_ENABLED:'true'}));
  for (const key of Object.keys(env)) {
    const copy = { ...env };
    delete copy[key];
    assert.equal(customerSettings(copy), undefined, key);
    assert.equal(quotationSettings({...copy,ENQUIRY_QUOTATIONS_ENABLED:'true'}),undefined,key);
  }
  for (const SITE_URL of [
    "http://example.test",
    origin + "/path",
    origin + "/",
    "https://user:pass@example.test",
  ])
    assert.equal(customerSettings({ ...env, SITE_URL }), undefined);
});

test('file-only intake needs its independent enable flag and retains verification response',async()=>{
 const quotation={...input,manual:undefined,quotation:true};
 assert.equal((await customerHandlers(base).POST(request(quotation))).status,503);
 const response=await customerHandlers({...base,quotationEnabled:()=>true}).POST(request(quotation));
 assert.equal(response.status,202);
 const result=await response.json();assert.equal(result.status,'awaiting-verification');assert.equal(result.emailSent,false);
});
test("intake blocks disabled, cross-origin, wrong-host, oversized, malformed and throttled requests before saving", async () => {
  let calls = 0;
  const deps = {
    ...base,
    submit: async () => {
      calls++;
      return { reference, repeated: false };
    },
  };
  assert.equal(
    (
      await customerHandlers({ ...deps, settings: () => undefined }).POST(
        request(input),
      )
    ).status,
    503,
  );
  assert.equal(
    (
      await customerHandlers(deps).POST(
        request(input, origin, { origin: "https://evil.invalid" }),
      )
    ).status,
    403,
  );
  assert.equal(
    (await customerHandlers(deps).POST(request(input, "https://wrong.test")))
      .status,
    403,
  );
  assert.equal(
    (
      await customerHandlers(deps).POST(
        request(input, origin, { "content-type": "text/plain" }),
      )
    ).status,
    415,
  );
  for (const body of [
    "{",
    "x".repeat(33000),
    { ...input, manual: { model: "X", quantity: 0, range: "bar" } },
  ])
    assert.equal(
      (await customerHandlers(deps).POST(request(body))).status,
      400,
    );
  assert.equal(
    (
      await customerHandlers({ ...deps, allow: async () => false }).POST(
        request(input),
      )
    ).status,
    429,
  );
  assert.equal(calls, 0);
});
test("acceptance returns a resend receipt but never claims delivery or reserves stock", async () => {
  const response = await customerHandlers(base).POST(request(input));
  assert.equal(response.status, 202);
  const body = await response.json();
  assert.equal(body.reference, reference);
  assert.equal(readReceipt(body.receipt, secret), reference);
  assert.equal(body.emailSent, false);
  assert.equal(body.stockReserved, false);
  assert.equal(body.status, "awaiting-verification");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(
    (
      await customerHandlers({
        ...base,
        submit: async () => {
          throw new CustomerLimitError();
        },
      }).POST(request(input))
    ).status,
    429,
  );
});
test("resend exposes no existence, confirmation or cooldown state and requires a signed receipt", async () => {
  let calls = 0;
  const h = customerHandlers({
    ...base,
    resend: async () => {
      calls++;
      return { outcome: "unavailable" };
    },
  });
  const bad = await h.resend(request({ receipt: "invalid" }));
  assert.equal(bad.status, 202);
  assert.equal(calls, 0);
  const good = await h.resend(
    request({ receipt: createReceipt(reference, secret) }),
  );
  assert.equal(good.status, 202);
  assert.equal(calls, 1);
  assert.deepEqual(await bad.json(), await good.json());
  const limited = await customerHandlers({
    ...base,
    resend: async () => {
      throw new CustomerLimitError();
    },
  }).resend(request({ receipt: createReceipt(reference, secret) }));
  assert.deepEqual(await limited.json(), { accepted: true });
});
