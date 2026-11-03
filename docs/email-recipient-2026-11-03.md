# Receiving email update — 3 November 2026

Nour explicitly requested changing the business email and RFQ/quotation recipient to **elamal4supplies@gmail.com**, and authorized a real verification email and RFQ flow test to that address.

Updated the shared public business email, ordinary enquiry fallback, quotation finalization fallback and example configuration. The production Vercel ENQUIRY_NOTIFICATION_TO setting was updated successfully to the new address. Sender remains enquiries@al-amaleg.com through the existing verified Resend domain. No new DNS or Gmail credential is needed.

The read-only routing review found no missed active old-address references. Existing queued notifications preserve their original snapshotted recipient; historical records and prior deliveries are not rewritten. A new test must be created after the production rebuild to use the new recipient.

Verification so far: 31 focused mail/enquiry/configuration tests succeeded. Publication and a real confirmation-email test are in progress. The client must personally open the email link and press Confirm; no staff bypass or database verification flag will substitute for proving mailbox access.

Monitoring means periodic independent availability checks and alerts when the site or a key endpoint fails. Checkly setup remains deferred by Nour's earlier instruction. No new monitoring subscription, provider installation or paid plan has been activated by this change.
