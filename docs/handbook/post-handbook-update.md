# Update after the handbook baseline

Date: 29 September 2026. The main handbook records application release7f73267 and was delivered before further development resumed. This dated update records what changed afterward; it takes precedence over the two source findings described in the baseline security chapters.

- **Staff account unlocking:** only an owner may unlock a staff account. Sales, warehouse, catalogue editors and anonymous callers are refused. This keeps account administration within the owner role. Existing login and password rules are unchanged.
- **Notification privacy:** normal owner and sales API reads retain useful delivery status, attempts and reference fields but omit the internal delivery key and worker lease identifier. Merely hiding a field in the admin interface did not restrict its API representation. Trusted internal workers retain access needed to send and finish a queued message.
- **Clearer admin instructions:** the enquiry screen now explains which fields staff can edit, where stock holds are managed and where email delivery results are found. The legacy Delivery Status field is explicitly described as a submission snapshot, not current email status.
- **Repeatable verification:** the new isolated database test covers eleven account, queue and worker checks. Before correction it reproduced five failures; afterward all eleven succeeded. It also verifies that a legitimate owner can unlock and that two competing fake workers deliver exactly once. All142 unit tests and TypeScript succeeded. The database regression is included in GitHub's existing quality workflow.
- **Continuation notes:** obsolete wording saying that a restore rehearsal had not happened was corrected. The completed rehearsal is documented separately from automatic offsite backup scheduling, which is still outstanding.

No customer data, actual stock, owner password, public design or schema was changed for these fixes. All test data used an empty development schema that was removed afterward. Email tests used a fake transport. Customer sending and recovery delivery remain disabled pending their existing prerequisites; monitoring remains deferred at Nour's request.

Release state at this checkpoint: local verification complete; cloud build and live deployment checks pending. See PROGRESS.md for the subsequent exact release result.
