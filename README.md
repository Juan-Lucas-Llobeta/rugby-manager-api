# Rugby Manager API

Backend REST API for Rugby Manager. Consumed by the web, iOS, and Android clients.

## Stack

- Node.js 20+, Express
- MySQL 8+ (stored procedures)
- JWT authentication
- OpenAPI 3.0 (Swagger UI in development)

## Quick start

```bash
cp .env.example .env
# Edit .env with database credentials and JWT_SECRET (min 32 chars)
npm install
npm run dev
```

API: `http://localhost:3001`  
Swagger (dev only): `http://localhost:3001/api-docs`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon |
| `npm start` | Production start |
| `npm test` | Run tests |
| `npm run openapi:export` | Regenerate `openapi.json` |

## Database

See [database/README.md](database/README.md).

1. Apply `database/sqlschema.sql`
2. Apply stored procedures per entity (guide in [docs/documentation.txt](docs/documentation.txt))

For Aiven MySQL, set `DB_SSL=true` and `DB_SSL_CA` in `.env`.

## Environment variables

| Variable | Description |
|----------|-------------|
| `DB_*` | MySQL connection |
| `PORT` | API port (default 3001) |
| `NODE_ENV` | `development` / `production` |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (web, staging, prod) |
| `JWT_SECRET` | Min 32 chars in production |
| `JWT_EXPIRES_IN` | Token TTL (default 24h) |

## API contract

The official contract is [`openapi.json`](openapi.json). Regenerate after route changes:

```bash
npm run openapi:export
```

Mobile and web clients should use this spec as the source of truth.

## Related repositories

- [rugby-manager-web](https://github.com/Juan-Lucas-Llobeta/rugby-manager-web) — React web app
- [rugby-manager-ios](https://github.com/Juan-Lucas-Llobeta/rugby-manager-ios) — iOS client (planned)
- [rugby-manager-android](https://github.com/Juan-Lucas-Llobeta/rugby-manager-android) — Android client (planned)

## Staging deployment

See [DEPLOY.md](DEPLOY.md) for staging setup and `ALLOWED_ORIGINS` configuration.
