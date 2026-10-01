import { readInput } from "./enquiry-http.ts";
import {
  parseEnquiry,
  EnquiryInputError,
  EnquiryConflictError,
} from "./enquiries.ts";
import { createReceipt, readReceipt } from "./customer-receipt.ts";
import {QueueCapacityError} from './queue-capacity.ts';
export class CustomerLimitError extends Error {}
type Deps = {
  settings: () => { origin: string; secret: string } | undefined;
  allow: (headers: Headers, scope: string) => Promise<boolean>;
  submit: (input: unknown) => Promise<{ reference: string; repeated: boolean }>;
  resend: (reference: string) => Promise<unknown>;
  quotationEnabled?:()=>boolean;
};
const json = (body: unknown, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      ...(status === 429 || status === 503 ? { "Retry-After": "60" } : {}),
    },
  });
export function customerHandlers(deps: Deps) {
  const check = (r: Request) => {
    const settings = deps.settings();
    if (!settings) return json({ error: "Submission unavailable" }, 503);
    if (
      new URL(r.url).origin !== settings.origin ||
      r.headers.get("origin") !== settings.origin
    )
      return json({ error: "Invalid origin" }, 403);
    if (
      r.headers.get("content-type")?.split(";")[0].trim() !== "application/json"
    )
      return json({ error: "JSON required" }, 415);
  };
  return {
    GET: async (r: Request) =>
      json({ canSubmit: deps.settings()?.origin === new URL(r.url).origin,canSubmitQuotation:deps.settings()?.origin === new URL(r.url).origin&&!!deps.quotationEnabled?.() }),
    POST: async (r: Request) => {
      const denied = check(r);
      if (denied) return denied;
      try {
        if (!(await deps.allow(r.headers, "customer-intake")))
          return json({ error: "Try again later" }, 429);
        const input = parseEnquiry(await readInput(r));
        if(input.quotation&&!deps.quotationEnabled?.())return json({error:'Quotation intake unavailable'},503);
        input.contact.email = input.contact.email.toLowerCase();
        if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(input.contact.email))
          throw new EnquiryInputError("Invalid email");
        const saved = await deps.submit(input);
        return json(
          {
            reference: saved.reference,
            receipt: createReceipt(saved.reference, deps.settings()!.secret),
            status: "awaiting-verification",
            emailSent: false,
            stockReserved: false,
          },
          202,
        );
      } catch (error) {
        if (error instanceof CustomerLimitError)
          return json({ error: "Try again later" }, 429);
        if (error instanceof EnquiryInputError)
          return json({ error: "Check your details and selected items" }, 400);
        if (error instanceof EnquiryConflictError)
          return json({ error: "Request changed; review it again" }, 409);
        return json(
          {
            error: "Unable to confirm submission. Retry with the same details.",
          },
          503,
        );
      }
    },
    resend: async (r: Request) => {
      const denied = check(r);
      if (denied) return denied;
      try {
        if (!(await deps.allow(r.headers, "customer-resend")))
          return json({ error: "Try again later" }, 429);
        const body = await readInput(r, 4096),
          reference = readReceipt(body?.receipt, deps.settings()!.secret);
        if (reference) await deps.resend(reference);
        // Do not disclose missing/confirmed/expired enquiries or email quota outcomes.
        return json({ accepted: true }, 202);
      } catch (error) {
        if (error instanceof CustomerLimitError || error instanceof QueueCapacityError)
          return json({ accepted: true }, 202);
        return json(
          { error: "Unable to process request" },
          error instanceof EnquiryInputError ? 400 : 503,
        );
      }
    },
  };
}
