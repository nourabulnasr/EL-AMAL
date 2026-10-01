"use client";
import { useEffect, useRef, useState } from "react";
import type { EnquiryDetails } from "@/lib/enquiry-preview";
import type { Locale } from "@/lib/catalogue";
import { useBasket } from "./basket-provider";
type Saved = { signature: string; reference: string; receipt: string };
export function CustomerEnquirySubmit({
  details,
  locale,
  active,
  manual,
  quotation,
}: {
  details: EnquiryDetails;
  locale: Locale;
  active: boolean;
  manual?: { model: string; quantity: number; range: string };
  quotation?:true;
}) {
  const { lines, catalogue, publicEnquiries } = useBasket(),
    ar = locale === "ar";
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [saved, setSaved] = useState<Saved | null>(null);
  const [cooldown, setCooldown] = useState(0),
    [resendNotice, setResendNotice] = useState(false);
  const request = useRef<{ signature: string; key: string } | null>(null),
    lock = useRef(false);
  const signature = JSON.stringify({
    locale,
    contact: details,
    lines: manual||quotation ? [] : lines,
    manual,
    quotation,
  });
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(
      () => setCooldown((n) => Math.max(0, n - 1)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [cooldown]);
  if (!active || !publicEnquiries || catalogue.source !== "cms") return null;
  const post = async (path: string, body: unknown) => {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
    if (response.status === 429) throw new Error("limited");
    if (!response.ok) throw new Error("unavailable");
    return response.json();
  };
  const act = async (run: () => Promise<void>) => {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      await run();
    } catch (e) {
      setError(e instanceof Error ? e.message : "unavailable");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  };
  return (
    <div className="review-notice" aria-busy={busy}>
      {saved?.signature === signature ? (
        <>
          <div role="status">
            <strong>
              {ar
                ? "تم استلام بياناتك — أكد بريدك الإلكتروني"
                : "Details received — confirm your email"}
            </strong>
            <p>
              <bdi>{saved.reference}</bdi>
            </p>
            <p>
              {ar
                ? "رسالة التأكيد في قائمة الإرسال. راجع بريدك ومجلد الرسائل غير المرغوبة. ينتهي رابط التأكيد خلال ساعة."
                : "Your confirmation email is queued. Check your inbox and spam folder. The confirmation link expires in one hour."}
            </p>
            <p>
              {quotation?(ar?'بعد التأكيد، أرفق ملفات عرض السعر ثم اضغط إرسال الملفات للمراجعة. لم تُرسل أي ملفات بعد.':'After confirmation, attach your quotation files and select Send files for review. No files have been submitted yet.'):ar
                ? "يراجع الفريق طلبك بعد التأكيد. لم يتم حجز أي مخزون."
                : "The team can review your enquiry after confirmation. No stock is reserved."}
            </p>
          </div>
          {resendNotice && (
            <p role="status">
              {ar
                ? "إذا كان الطلب مؤهلاً، فستُرسل رسالة تأكيد جديدة. استخدم أحدث رابط يصلك."
                : "If your request is eligible, another confirmation will be queued. Use the newest link you receive."}
            </p>
          )}
          <button
            type="button"
            className="button button-dark"
            disabled={busy || cooldown > 0}
            onClick={() =>
              act(async () => {
                await post("/api/customer-enquiries/resend", {
                  receipt: saved.receipt,
                });
                setResendNotice(true);
                setCooldown(60);
              })
            }
          >
            {cooldown > 0
              ? ar
                ? `إعادة الإرسال بعد ${cooldown} ثانية`
                : `Resend in ${cooldown}s`
              : ar
                ? "إعادة إرسال رابط التأكيد"
                : "Resend confirmation link"}
          </button>
        </>
      ) : (
        <>
          <p>
            {ar
              ? quotation?"سنحفظ بيانات التواصل ونرسل رابط التأكيد. أرفق ملفاتك بعد تأكيد البريد، دون إعادة كتابة المنتجات.":"سيُحفظ الطلب وتُضاف رسالة تأكيد إلى قائمة الإرسال. لن يتم حجز مخزون أو إنشاء طلب شراء."
              : quotation?"We will save your contact details and queue a confirmation link. Attach your files after confirming your email, without retyping any products.":"Submitting saves your requirement and queues a confirmation email. It does not reserve stock or place an order."}
          </p>
          <button
            type="button"
            className="button button-dark"
            disabled={busy}
            onClick={() =>
              act(async () => {
                if (request.current?.signature !== signature)
                  request.current = { signature, key: crypto.randomUUID() };
                const result = await post("/api/customer-enquiries", {
                  ...JSON.parse(signature),
                  requestKey: request.current.key,
                });
                if (
                  typeof result.reference !== "string" ||
                  typeof result.receipt !== "string"
                )
                  throw new Error("unavailable");
                setSaved({
                  signature,
                  reference: result.reference,
                  receipt: result.receipt,
                });
                setCooldown(60);
                setResendNotice(false);
              })
            }
          >
            {busy
              ? ar
                ? "جارٍ الإرسال…"
                : "Submitting…"
              : ar
                ? "إرسال الطلب وتأكيد البريد"
                : "Submit and verify email"}
          </button>
        </>
      )}
      {error && (
        <p role="alert">
          {error === "limited"
            ? ar
              ? "وصلت إلى حد المحاولات. حاول لاحقاً."
              : "The request limit has been reached. Please try again later."
            : ar
              ? "تعذر تأكيد العملية. أعد المحاولة بنفس التفاصيل لتجنب التكرار."
              : "We could not confirm this action. Retry with the same details to avoid duplicates."}
        </p>
      )}
    </div>
  );
}
