# Database backup and recovery

The source repository is not a database backup. `scripts/database-backup.mjs` produces an authenticated encrypted PostgreSQL custom archive and encrypted manifest. Use PostgreSQL tools matching or newer than the server major version (hosted Neon currently uses PostgreSQL18).

## Protection and verification

- A repeatable-read exported snapshot is shared by the row manifest and `pg_dump`. All public tables are included, including catalogue, roles, stock, enquiries, outboxes and encrypted photo records.
- AES-256-GCM uses a separate random backup key. The archive and manifest have independent nonces; the manifest binds the archive's SHA-256 digest.
- Restore authenticates the whole archive before `pg_restore`. Plaintext exists only in a randomly created local operating-system temporary directory, not beside a synced backup. Cleanup attempts every step even after failures.
- Rehearsal requires an explicitly named, unpooled development host different from the backup source. It creates a random new database, restores only there, compares every table's row count and sorted row fingerprints plus constraint count, then deletes only that database.
- SQL tool errors are classified without logging row contents, credentials or arbitrary provider diagnostics. Native PostgreSQL connection environment overrides are removed.
- This backup covers the public application schema. It does not export Neon account settings, cluster roles, DNS/provider accounts or local secrets. Product media bundled in Git is recovered from the matching source revision. Encrypted photos/outboxes also require the original Payload secret; keep that separately in a password manager.

## Commands

Use a direct/unpooled URL. Keep source credentials private. The ignored local configuration points at portable tools and a backup key stored outside OneDrive.

```powershell
node --env-file=.env.hosted.local --env-file=.env.backup.local scripts/database-backup.mjs create artifacts/backups/el-amal-YYYY-MM-DD.enc
node --env-file=.env.backup.local scripts/database-backup.mjs rehearse artifacts/backups/el-amal-YYYY-MM-DD.enc
```

Required configuration: `DATABASE_URL_UNPOOLED` (or `BACKUP_DATABASE_URL`), `PG_BIN_DIR` if tools are not on PATH, `BACKUP_KEY_FILE` pointing to a base64-encoded random32-byte key. Rehearsal also requires `RESTORE_DATABASE_URL` and `RESTORE_ALLOWED_HOST`. `BACKUP_ENCRYPTION_KEY` is supported for a protected CI secret instead of a local file.

Both `.enc` and `.enc.manifest.enc` files are needed. Copy them to approved offsite storage, and keep the encryption key in a separate password manager/secret store. Do not email keys or commit them. The script refuses overwriting an existing archive. Successful rehearsal reports are unique per run and contain counts, not records.

## Actual recovery

Keep the affected database unchanged for diagnosis. Create a separate replacement database, restore the authenticated archive under an operator's supervision, apply any forward migrations, and validate CMS login/catalogue/private records. Point a protected candidate deployment at the replacement; verify before switching production. Never use the rehearsal command as an in-place production restore.

An occasional local backup does not provide continuous recovery. Automatic offsite scheduling, retention, the Neon restore window and a recovery time/data-loss policy still require operational setup and acceptance. Do not call those active until their own execution and alerting are verified.
