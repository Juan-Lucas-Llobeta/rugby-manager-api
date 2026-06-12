# Staging deployment

Deploy the API to any Node.js host (Railway, Render, Fly.io, VPS, etc.).

## Required environment variables

```
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=
PORT=3001
NODE_ENV=production
JWT_SECRET=<min 32 random chars>
JWT_EXPIRES_IN=24h
ALLOWED_ORIGINS=https://your-web-staging.example.com,http://localhost:5173
```

For Aiven MySQL add `DB_SSL=true` and `DB_SSL_CA`.

## CORS

Every client origin must be listed in `ALLOWED_ORIGINS` (comma-separated, no trailing slashes):

| Client | Example origin |
|--------|----------------|
| Web (local) | `http://localhost:5173` |
| Web (staging) | `https://rugby-manager-web-staging.example.com` |
| Web (prod) | `https://app.example.com` |

Mobile native apps typically do not send an `Origin` header; CORS applies to browser clients only.

## Health check

```
GET /api/health
```

## Post-deploy checklist

1. `GET /api/health` returns 200
2. `POST /api/auth/login` works with test credentials
3. Web client `VITE_API_URL` points to `https://<api-host>/api`
4. Browser login from web staging succeeds (CORS OK)
