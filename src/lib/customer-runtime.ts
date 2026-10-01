import { customerSettings,quotationSettings } from "./customer-readiness";
import { customerHandlers } from "./customer-http";
import { allowRequest, requestLimitKey } from "./request-limits";
import { loadCatalogue } from "./load-catalogue";
import {
  submitCustomerEnquiry,
  resendCustomerEnquiry,
} from "./customer-service";
async function cms() {
  const [{ getPayload }, { default: config }] = await Promise.all([
    import("payload"),
    import("@/payload.config"),
  ]);
  return getPayload({ config });
}
function settings() {
  const value = customerSettings();
  if (!value) throw new Error("Customer intake unavailable");
  return value;
}
export const handlers = customerHandlers({
  settings: customerSettings,
  quotationEnabled:()=>!!quotationSettings(),
  allow: async (headers, scope) =>
    allowRequest(await cms(), requestLimitKey(headers, scope), 6),
  submit: async (input) =>
    submitCustomerEnquiry(
      await cms(),
      input,
      await loadCatalogue(),
      settings(),
    ),
  resend: async (reference) =>
    resendCustomerEnquiry(await cms(), reference, settings()),
});
