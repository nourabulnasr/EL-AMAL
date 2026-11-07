# Google Ads measurement implementation plan

Prepared 7 November 2026. **Not implemented or activated.** Client-owned Ads account, real public tag/label identifiers, consent/privacy acceptance and a verified implementation remain prerequisites. No placeholder scripts, third-party requests or made-up conversion values were deployed.

## Exact milestones in the existing flow

| Action | Proposed Ads treatment | Actual application milestone |
|---|---|---|
| Product RFQ | Primary lead action, count One | Successful customer-mode confirmation of a products request, not initial HTTP202 acceptance or clicking Confirm |
| Existing quotation | Primary lead action, count One | Successful finalisation after at least one accepted private file; not merely verifying email or uploading one chunk |
| Phone click | Secondary interaction | Activation of the published tel link; does not prove a connected call |
| WhatsApp click | Secondary interaction, where enabled | Activation of the published WhatsApp link; does not prove a message or sale |
| Catalogue selection/basket add | Keep in existing product-interest report | Do not optimise advertising toward a basket click instead of an actual lead |

Relevant existing components: `src/components/verify-enquiry.tsx` and `src/components/quotation-file-upload.tsx`. Product confirmation happens after a server response with customer mode. Quotation completion is acknowledged by `control('finalize')` returning submitted true. Demo/test mode must never generate a real lead event.

## Requirements before code and launch

1. Obtain the Ads account's actual Google tag ID and separate product/quotation conversion labels. Use one collection route per action to avoid counting both direct Ads events and an imported GA4 version of the same lead.
2. Agree consent and privacy wording. Existing first-party catalogue consent must not silently become permission to send data to Google. Use a distinct explicit advertising measurement choice or a reviewed consent solution. For the initial conservative design, load no Google tag and send no Google measurement before affirmative relevant consent. Do not send advanced consent-mode pings by default.
3. Load the tag only on public site pages after consent; exclude admin/staff and verification credentials. Verification links contain a secret URL fragment. Redact/clear the fragment before loading any third-party tag. Do not send token, upload grant, filenames, contact details, RFQ free text, photos, database IDs or full sensitive page URLs to Google.
4. Introduce a safe opaque deduplication key for the successful request, available only after success. Verify quotation status recovery and repeat-finalisation semantics. Use the same non-secret key on retries and the Ads transaction ID mechanism. Browser storage alone is not proof that server finalisation happened. Do not expose access receipts, reference capabilities or customer tokens as analytics identifiers.
5. Check attribution through the actual email-confirmation journey, including another browser/device. Basic browser tagging cannot guarantee cross-device attribution. Do not claim perfect attribution or silently begin retaining click IDs/PII server-side. An offline/enhanced-conversion integration would require a separately reviewed data/consent plan.
6. Update CSP only for the exact official hosts required by the chosen tag implementation; no broad wildcard allowlists. Add server-side configuration validation and a disabled/unconfigured state. No API keys belong in public JS.
7. Do not invent enquiry revenue. If no credible business value is provided, measure leads without presenting a fabricated order value. Count One for each lead action.
8. Test with Tag Assistant and the real account. A successful implementation must distinguish actual recorded events, consent-blocked events, ad-blocker loss and account diagnostic lag.

## Acceptance checks

- Missing configuration or no consent: no Google loader or collection request, normal RFQ unaffected.
- Validation error, timeout, rate limit, expired verification, demo mode: no primary conversion.
- Confirmed products RFQ: one product lead event, no quotation event.
- Verified quotation without files/finalisation: no primary conversion yet.
- Finalised quotation: one quotation lead event only.
- Refresh, back, repeat-confirm, finalisation retry/status recovery: no duplicate lead.
- Arabic and English, keyboard and mobile: same semantics.
- Verification token/hash is cleared before any third-party loader and no private strings in payloads or request URLs.
- If consent is declined or a blocker prevents measurement, do not show a false advertising-tracking success or fail the customer's enquiry.

Official installation reference: https://support.google.com/google-ads/answer/7548399
Manual conversion setup: https://support.google.com/google-ads/answer/12718882

This is a concrete implementation plan, not an assertion that Google Ads tracking is ready. Installing an unconfigured analytics scaffold would not complete the missing account-dependent work.
