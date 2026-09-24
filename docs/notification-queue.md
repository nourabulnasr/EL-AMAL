# Notification queue

This increment prepares staff enquiry notifications. It does not configure a sender, send email, expose a worker endpoint, or schedule delivery. Recipient defaults to the inbox confirmed by Nour and can be set with ENQUIRY_NOTIFICATION_TO; this is not a sender credential.

New enquiries and one unique notification record are created in the same PostgreSQL transaction. Queue failure rolls back the enquiry. Existing request-key deduplication also deduplicates queue records. Existing enquiries are not automatically backfilled.

Sample catalogue requests are permanently marked disabled by the submission service. The worker selects only source=cms records. Owner/sales can inspect the queue; all direct API creation, editing and deletion is denied. Delivery details are maintained only by trusted server code.

The injectable worker has no default transport. Without a transport it performs no work. With a transport, an atomic PostgreSQL claim uses SKIP LOCKED and a random five-minute lease. A stable delivery key must be passed to a provider that supports idempotent sends, including timeout retries. Successful sends store a provider receipt; failures retain a generic error and retry after exponential delays. Five attempts is the limit. Expired claims are recoverable; late worker results cannot overwrite a newer lease. Provider-side idempotency is required to prevent duplicate mail after a send succeeds but recording its receipt fails.

Message content includes the enquiry reference only, not customer notes, addresses or attachments. Public form remains staff-only demo testing. No claim of verified customer email is made. Customer verification tokens/links, sender adapter/configuration, scheduling, delivery-timeout handling, operational monitoring and public abuse controls remain separate work before activation.

Validation: development tests use a fake transport with no network sends, including atomic rollback, demo suppression, delayed retries, simultaneous workers, stale lease results and retry exhaustion. Test data is removed. See PROGRESS.md for deployment evidence.
