# AI x MAD Studio OS — Independent Web App

A mobile-first private business operating dashboard for AI x MAD Studio, rebuilt as a standalone Next.js 16 web application. **No Floot runtime, APIs, dependencies, database or branding.**

## Core modules

- Dashboard: live counts for leads, pipeline opportunities, quote value and active projects.
- Lead Hunter: manual lead capture, prospect details, deterministic lead scoring and pipeline stages.
- CRM: pipeline board and stage updates.
- Quotes: draft creation, quotation copying; manual review before sharing.
- Projects: delivery phases and optional GitHub/Vercel links.
- Deployments and AI workspace: clearly labeled future integrations, *not* falsely reported as connected.
- Responsive iPhone bottom navigation + standalone Home Screen PWA.

## Architecture

Next.js 16 App Router, React 19, Neon PostgreSQL with Managed Better Auth, private owner-checked Next.js API routes, Vercel hosting (pending) and GitHub source. Store `DATABASE_URL` and `NEON_AUTH_COOKIE_SECRET` only in server-side hosting secrets.

## Neon setup

Neon project `hidden-cherry-39169820` (Singapore) is **already created** with the `studio_os` database, Managed Better Auth and `public.studio_records` table. The repo's reproducible schema is `neon/migrations/20261014_studio_records.sql`.

Only the verified owner email set by `STUDIO_OWNER_EMAIL` can access the dashboard and private API. Any request missing a valid session returns HTTP 401. Do not expose `DATABASE_URL` in client code.

## Run locally

```sh
npm install
cp .env.example .env.local
# fill DATABASE_URL, NEON_AUTH_BASE_URL, NEON_AUTH_COOKIE_SECRET, STUDIO_OWNER_EMAIL
npm run dev
```

## Deploy to Vercel

1. GitHub source is already pushed to `Karthi7170/aimad-studio-os` on `main`. Review its current public visibility if you prefer a private internal repository.
2. Import the repo in Vercel. Framework: Next.js; root directory: `/`.
3. Add server-only `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, and `STUDIO_OWNER_EMAIL` environment variables to the Vercel project.
4. Deploy, then test login, add/edit lead, quotation, project, sign-out and sign-in.
5. On iPhone in Safari: Share → Add to Home Screen.

**Important**: A commercial business app should run on a commercial-eligible Vercel plan (e.g. Pro), not Hobby. This app is not published to the existing studio domain automatically. Preserve the existing Floot app until you've tested the independent version with real credentials.

## Data migration

Existing Floot CRM records were zero when checked. Neon login identities are new, so use Google sign-in with the owner email. Keep the Floot app online until Vercel end-to-end checks pass.
