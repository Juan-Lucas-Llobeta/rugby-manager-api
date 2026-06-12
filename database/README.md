# Database schema

Source of truth for the Rugby Manager MySQL schema.

## Files

| File | Purpose |
|------|---------|
| `sqlschema.sql` | Table definitions (apply first) |
| `sptemplate.sql` | Template for stored procedure naming conventions |
| Individual `sp_*.sql` | Per-entity stored procedures (see `docs/documentation.txt`) |

## Local setup

1. Create an empty database.
2. Apply `sqlschema.sql`.
3. Apply stored procedures for each entity in dependency order.

## Dumps and backups

Files matching `*_dump.sql` or `*_backup.sql` are **gitignored** and must not be committed.
They may contain real user data (emails, password hashes).

For local restores, use anonymized dumps only.

## SSL (Aiven)

Place the CA certificate at `backend/certs/aiven-ca.pem` (gitignored) and set `DB_SSL_CA` in `backend/.env`.
