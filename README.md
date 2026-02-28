# BiteSpeed

Node.js TypeScript API with Express and Prisma (PostgreSQL/Neon).

## Quick start

```bash
npm install
cp .env.template .env   # set DATABASE_URL
npm run db:generate
npm run db:push
npm run dev
```

## Identify endpoint

**`POST /identify`** — Resolves and merges contacts by email and/or phone.

- **Request:** `{ email?: string, phoneNumber?: string }` (at least one required)
- **Response:** `contact.primaryContactId`, `emails`, `phoneNumbers`, `secondaryContactIds`

## Utils (identify flow)

- **contactFetcher** — Two-phase fetch: match by email/phone, then expand by cluster (primary/linkedId)
- **clusterBuilder** — Splits contacts into primaries and secondaries
- **clusterMerger** — Handles create / single-cluster update / multi-cluster merge (with transactions)
- **responseBuilder** — Builds final payload with deduplicated emails and phone numbers
- **identifyHandler** — Validates input, runs the pipeline, returns 200/400/500
