import { cmsEnabled } from "./cms-runtime.ts";
import { mailReadiness } from "./mail-transport.ts";
import {
  validateVerificationSettings,
  type VerificationSettings,
} from "./verification-message.ts";
export function customerSettings(
  env: Record<string, string | undefined> = process.env,
): VerificationSettings | undefined {
  if (
    env.PUBLIC_ENQUIRIES_ENABLED !== "true" ||
    env.ENQUIRY_WORKERS_READY !== "true" ||
    env.CATALOGUE_SOURCE !== "cms" ||
    env.VERIFICATION_DELIVERY_ENABLED !== "true" ||
    !cmsEnabled(env) ||
    !Object.values(mailReadiness(env)).every(Boolean)
  )
    return;
  const settings = {
    secret: env.PAYLOAD_SECRET!,
    origin: env.SITE_URL ?? "",
    from: env.MAIL_FROM ?? "",
  };
  try {
    validateVerificationSettings(settings);
    return settings;
  } catch {
    return;
  }
}
