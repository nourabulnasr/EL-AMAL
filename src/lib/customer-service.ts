import type { Payload } from "payload";
import type { Catalogue } from "./public-catalogue.ts";
import type { VerificationSettings } from "./verification-message.ts";
import { validateVerificationSettings } from "./verification-message.ts";
import { parseEnquiry } from "./enquiries.ts";
import { submitEnquiry } from "./submit-enquiry.ts";
import { resendVerification } from "./verification-outbox.ts";
import { reserveEmailAttempt } from "./customer-quota.ts";
import { emailLimitKey, attemptLimitKey } from "./customer-receipt.ts";
import { CustomerLimitError } from "./customer-http.ts";
import {assertFreshDeliveryHealth} from './delivery-operations.ts';
import {quotationSettings} from './customer-readiness.ts';
async function allowance(
  payload: Payload,
  email: string,
  attempt: string,
  secret: string,
) {
  if (
    !(await reserveEmailAttempt(
      payload,
      emailLimitKey(email, secret),
      attemptLimitKey(email, attempt, secret),
    ))
  )
    throw new CustomerLimitError();
}
export async function submitCustomerEnquiry(
  payload: Payload,
  raw: unknown,
  catalogue: Catalogue,
  settings: VerificationSettings,
) {
  validateVerificationSettings(settings);
  if (catalogue.source !== "cms")
    throw new Error("Customer intake requires reviewed catalogue mode");
  const input = parseEnquiry(raw);
  if(input.quotation&&!quotationSettings())throw new Error('Quotation intake unavailable');
  input.contact.email = input.contact.email.toLowerCase();
  return submitEnquiry(payload, input, catalogue, settings, async () => {
    // submitEnquiry resolves committed request-key retries before this callback.
    // Refuse a new request before consuming its email allowance during an outage.
    await assertFreshDeliveryHealth(statement=>payload.db.pool.query(statement));
    await allowance(
      payload,
      input.contact.email,
      `submit:${input.requestKey}`,
      settings.secret,
    );
  });
}
export async function resendCustomerEnquiry(
  payload: Payload,
  reference: string,
  settings: VerificationSettings,
) {
  validateVerificationSettings(settings);
  // Caller must validate the signed receipt. Never take a replacement email from HTTP input.
  const result = await payload.find({
    collection: "enquiries",
    overrideAccess: true,
    depth: 0,
    limit: 1,
    where: {
      and: [
        { reference: { equals: reference } },
        { source: { equals: "cms" } },
        { verificationStatus: { equals: "unverified" } },
      ],
    },
  });
  const enquiry = result.docs[0];
  if (!enquiry) return;
  await allowance(
    payload,
    enquiry.email,
    `resend:${reference}:${Math.floor(Date.now() / 60000)}`,
    settings.secret,
  );
  await resendVerification(payload, reference, settings);
}
