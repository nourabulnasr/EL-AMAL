import { createHmac, timingSafeEqual } from "node:crypto";
const referencePattern =
  /^EA-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const lifetime = 86400000;
function mac(value: string, secret: string) {
  if (secret.length < 32) throw new Error("Customer receipt unavailable");
  return createHmac("sha256", secret).update(value).digest("hex");
}
export function emailLimitKey(email: string, secret: string) {
  return mac(`customer-email-v1:${email.trim().toLowerCase()}`, secret);
}
export function attemptLimitKey(
  email: string,
  attempt: string,
  secret: string,
) {
  return mac(
    `customer-attempt-v1:${email.trim().toLowerCase()}:${attempt}`,
    secret,
  );
}
export function createReceipt(
  reference: string,
  secret: string,
  now = Date.now(),
) {
  if (!referencePattern.test(reference)) throw new Error("Invalid reference");
  const payload = `${reference}.${now + lifetime}`;
  return `${payload}.${mac(`customer-resend-v1:${payload}`, secret)}`;
}
export function readReceipt(
  value: unknown,
  secret: string,
  now = Date.now(),
): string | null {
  if (typeof value !== "string" || value.length > 180 || secret.length < 32)
    return null;
  const [reference, expiry, signature, ...extra] = value.split(".");
  if (
    extra.length ||
    !referencePattern.test(reference) ||
    !/^\d{13}$/.test(expiry ?? "") ||
    !/^[a-f0-9]{64}$/.test(signature ?? "")
  )
    return null;
  const expected = mac(`customer-resend-v1:${reference}.${expiry}`, secret);
  if (
    !timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex"),
    )
  )
    return null;
  const end = Number(expiry);
  return end > now && end <= now + lifetime ? reference : null;
}
