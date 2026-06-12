# Archived migration scripts

One-off scripts that were already applied to production/staging databases.
Do not run again unless you know the current schema state.

## migrate_torneos.js

Adds `id_equipo` to `Torneos` and updates related stored procedures.

**Requirements:** `backend/.env` with Aiven MySQL credentials.

**SSL:** Prefer `DB_SSL_CA` pointing to the Aiven CA certificate (see `backend/src/config/database.js`).
Avoid `rejectUnauthorized: false` in production.

**Run (only if needed on a fresh DB missing this migration):**

```bash
cd backend
node scripts/archive/migrate_torneos.js
```
