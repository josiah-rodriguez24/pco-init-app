# PCO Dashboard

A web app that wraps the **Planning Center Services API**, syncs data into a local PostgreSQL database, and presents it through a modern React dashboard. Built with Next.js, TypeScript, Tailwind CSS, and Prisma.

---

## Why does this exist?

Planning Center is the source of truth for worship service planning. This app sits between Planning Center and the end user, providing:

- **Fast page loads** — the UI reads from our own database, not from the PCO API on every request.
- **Rate-limit safety** — PCO's API has rate limits. By syncing data server-side and reading from our DB, we never risk hitting limits from browser traffic.
- **Centralized secrets** — the Planning Center PAT (Personal Access Token) stays server-side. The browser never touches it.
- **Normalized data** — PCO's JSON:API format is mapped into clean, relational tables that are easy to query and extend.

---

## Architecture

```
Browser (React)
    │
    │  fetch /api/* or server components
    ▼
Next.js Server (App Router)
    │
    ├──▶ PostgreSQL (Prisma)   ← UI reads from here
    │
    └──▶ Planning Center API   ← server-side syncs only
         (PAT Basic Auth)

Planning Center Webhooks ──▶ POST /api/webhooks/planning-center
```

**Key principle:** The browser talks only to our Next.js server. Our server talks to Planning Center. Secrets never leave the server.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| ORM | Prisma |
| Database | PostgreSQL |
| Deployment | Vercel-ready |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL (local or hosted)
- A Planning Center developer account with a Personal Access Token

### 1. Clone and install

```bash
git clone <your-repo-url>
cd pco-init-app
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your real values:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PLANNING_CENTER_CLIENT_ID` | PCO application ID |
| `PLANNING_CENTER_SECRET` | PCO secret (from your PAT) |
| `APP_BASE_URL` | Public URL of this app (e.g. `http://localhost:3000`) |
| `NODE_ENV` | `development`, `production`, or `test` |

Optional (not required for v1):

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Redis connection for caching (future) |
| `PLANNING_CENTER_WEBHOOK_SECRET` | HMAC secret for webhook verification (future) |

### 3. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (creates tables)
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to inspect data
npx prisma studio
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Syncing Data

The app does not call Planning Center on every page load. Instead, you trigger syncs manually (or later via cron).

### Sync service types

```bash
curl -X POST http://localhost:3000/api/pco/sync/service-types
```

### Sync plans

```bash
# Sync service types first, then plans
curl -X POST http://localhost:3000/api/pco/sync/service-types
curl -X POST http://localhost:3000/api/pco/sync/plans
```

### Health check

```bash
curl http://localhost:3000/api/health
```

---

## Project Structure

```
app/
  (dashboard)/         → Dashboard pages (server components)
  api/                 → API routes (server-only)
    health/            → Health check endpoint
    pco/sync/          → Sync trigger endpoints
    webhooks/          → Webhook receiver

components/
  ui/                  → Reusable UI components (Card, Badge, EmptyState)
  dashboard/           → Dashboard-specific components

lib/
  env.ts               → Zod-validated environment variables
  db.ts                → Prisma client singleton
  errors.ts            → Typed error classes
  utils.ts             → Shared utility functions
  planning-center/
    auth.ts            → PAT auth header builder
    client.ts          → Typed fetch wrapper with retry + rate-limit handling
    rate-limit.ts      → Rate-limit header parser
    pagination.ts      → Auto-pagination helper
    types.ts           → JSON:API transport types
    services.ts        → High-level PCO data fetchers
    mappers.ts         → PCO JSON:API → internal model mappers
  repositories/
    serviceTypesRepo   → Prisma access for service types
    plansRepo          → Prisma access for plans
  sync/
    syncServiceTypes   → Orchestrates service type sync
    syncPlans          → Orchestrates plan sync
    webhookProcessor   → Webhook storage and (future) processing

prisma/
  schema.prisma        → Database schema

types/
  planningCenter.ts    → Re-exported types for app-level imports
```

---

## Rate-Limit Strategy

This app is designed to avoid rate-limit problems:

1. **UI reads from PostgreSQL** — the browser never calls Planning Center.
2. **Syncs are server-side and on-demand** — triggered by API calls, not by page loads.
3. **Rate-limit headers are captured** — every PCO response's `X-PCO-API-Request-Rate-*` headers are parsed and logged when approaching limits.
4. **429 responses are respected** — the client reads `Retry-After` and waits before retrying (GET requests only, max 3 attempts).
5. **Pagination has a safety cap** — `fetchAllPages` stops after 50 pages by default to prevent runaway requests.
6. **Webhooks reduce the need for polling** — once configured, PCO pushes changes to us.

---

## Future Enhancements

The scaffold is designed so these can be added with minimal rewrites:

| Feature | Where to add |
|---------|-------------|
| **OAuth support** | `lib/planning-center/auth.ts` — swap PAT for token lookup |
| **Redis caching** | `lib/planning-center/client.ts` — add cache-aside wrapper |
| **Cron-based sync** | `app/api/pco/sync/*/route.ts` — add Vercel Cron config |
| **Webhook queue** | `lib/sync/webhookProcessor.ts` — replace inline processing with BullMQ |
| **App authentication** | `middleware.ts` + NextAuth in `app/api/auth/[...nextauth]/` |
| **Multi-tenant** | Add `organizationId` to models, scope queries in repositories |
| **Docker** | Add `Dockerfile` + `docker-compose.yml` at root; `DATABASE_URL` is already env-driven |

---

## Deployment (Vercel)

1. Push to GitHub.
2. Import the repo in [Vercel](https://vercel.com).
3. Set environment variables in the Vercel dashboard.
4. Vercel auto-detects Next.js — no special config needed.
5. Add a `build` script to your `package.json` if Prisma generate is needed:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

For the database, use a hosted PostgreSQL provider (e.g. Neon, Supabase, Railway).

---

## License

Private — not open source.
