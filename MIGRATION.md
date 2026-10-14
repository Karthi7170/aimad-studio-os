# AI x MAD Studio OS — GitHub / Neon / Vercel handoff

**Current status (14 October 2026):**
- GitHub source: [Karthi7170/aimad-studio-os](https://github.com/Karthi7170/aimad-studio-os), branch `main`.
- Neon database **CREATED**: project `hidden-cherry-39169820`, database `studio_os`, Singapore.
- Neon Managed Better Auth **ENABLED**. The `public.studio_records` table exists, RLS is enabled, and data rows are currently empty.
- Server-only Next.js CRM API and Neon Auth integration committed. TypeScript, syntax, source-security checks, and production build passed in GitHub Actions.
- **NOT YET DEPLOYED TO VERCEL**. The currently connected Vercel account rejects access to the intended team with HTTP 403.
- **NOT YET LIVE-TESTED**: production sign-in, authenticated CRUD, and iPhone Safari.
- Floot app stays online: https://aimad-studio-os.floot.app

## Deployment steps

1. In Vercel, reconnect/select an authorized team, then import `Karthi7170/aimad-studio-os` as a **Next.js** project.
2. Add these **server-only** environment variables in Vercel Project → Settings → Environment Variables:
   - `DATABASE_URL`: copy from **Neon Console → Connect**, database `studio_os`.
   - `NEON_AUTH_BASE_URL`: copy from Neon → Auth → Configuration.
   - `NEON_AUTH_COOKIE_SECRET`: generate a unique 32+-character random secret.
   - `STUDIO_OWNER_EMAIL`: the verified Google email that should control the studio (currently configured in the sample file as `OWNER_EMAIL@example.com`; confirm account choice before production).
3. In Neon Auth → Trusted Domains, add the **actual Vercel production hostname**, after Vercel allocates one.
4. Use the owner's Google account to sign in (shared OAuth for testing). For business production, configure owned Google OAuth credentials and email delivery as appropriate.
5. Test private authentication, create/update/delete a test lead, quotation and project, sign out/in, and verify owner-only access. Test the PWA in iPhone 17 Safari.
6. **Keep the existing Floot app online until every acceptance check passes.**

The SQL schema is at `neon/migrations/20261014_studio_records.sql`. **Do not use earlier Supabase migration instructions.**

## Security notes

- The database password and auth cookie secret must never be committed to GitHub or used with `NEXT_PUBLIC_` variable names.
- All database operations are processed server-side; SQL predicates restrict reads and writes to the verified signed-in user ID.
- CRM table RLS is enabled; public privileges are revoked. The Neon Data API should remain disabled for this project unless separate, reviewed grants/RLS policies are introduced.
- The app disables public email/password sign-up through its auth routes and restricts studio data access to `STUDIO_OWNER_EMAIL`.
- The current GitHub repository is public. Consider changing visibility if you want private company source code.
- AI API calls, automated lead sourcing, WhatsApp outreach, GitHub PR syncing and live Vercel deploy triggers are not implemented yet.

Commercial hosting requires a Vercel plan eligible for business use; Hobby is not for commercial production.
