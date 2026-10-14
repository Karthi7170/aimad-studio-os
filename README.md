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

Next.js 16 (App Router), React 19, Supabase Auth/Postgres with owner-scoped RLS, hosted on Vercel with source on GitHub. Public publishable Supabase key only; **never** expose a `service_role` or secret key in the browser or repository.

## Set up the database

1. Create a **new Supabase project** for this app rather than reusing the existing GCS/VIP-Hunter databases.
2. Run `supabase/migrations/20261014_studio_os.sql` in its SQL Editor.
3. In Supabase Auth, invite your account email (or create your admin user manually); disable public sign-ups if you want a single-owner workspace.
4. Set the project **Site URL** to your final Vercel production URL. Add `https://YOUR-VERCEL-URL/auth/callback` and `https://YOUR-VERCEL-URL/reset-password` as allowed redirect URLs. For local testing add `http://localhost:3000/auth/callback`.
5. Use a Supabase **publishable** key in browser code; the RLS policy enforces per-owner access.

## Run locally

```sh
npm install
cp .env.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

## Deploy to Vercel

1. GitHub source is already pushed to `Karthi7170/aimad-studio-os` on `main`. Review its current public visibility if you prefer a private internal repository.
2. Import the repo in Vercel. Framework: Next.js; root directory: `/`.
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and optional `NEXT_PUBLIC_APP_URL` to the Vercel project (Production, Preview as appropriate).
4. Deploy, then test login, add/edit lead, quotation, project, sign-out and sign-in.
5. On iPhone in Safari: Share → Add to Home Screen.

**Important**: A commercial business app should run on a commercial-eligible Vercel plan (e.g. Pro), not Hobby. This app is not published to the existing studio domain automatically. Preserve the existing Floot app until you've tested the independent version with real credentials.

## Data migration

The inspected Floot database had **zero** lead, proposal and project records at migration preparation time. Authentication from Floot cannot be copied with original passwords; invite/create a new user in Supabase. The JSON record structure is compatible with future export/import if needed.

## Known boundaries

- Lead discovery, WhatsApp sending, AI model calls, and GitHub/Vercel deployment triggers are **not connected**. Their cards are informational, avoiding accidental charges or unauthorized messages.
- Work in progress / not yet production-tested with your Supabase credentials; runtime smoke tests and authenticated CRUD must be completed after provisioning.
- No PWA offline cache is included; it needs internet for current CRM data.