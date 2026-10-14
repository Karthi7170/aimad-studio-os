# AI x MAD Studio OS — GitHub/Vercel migration handoff

## Current status (2026-10-14)

- **Independent source package complete:** Next.js 16, iPhone-style PWA, CRM, quotation and project workflows, Supabase Auth/RLS.
- **Source-level checks passed:** TypeScript/TSX parsing and security invariants (`npm run check:syntax` and `npm run check:security` after installing dependencies).
- **GitHub source is live:** https://github.com/Karthi7170/aimad-studio-os (main), and GitHub Actions has passed TypeScript and production build checks.
- **Vercel is NOT deployed:** The connected Vercel account returns HTTP 403 for team scope `karthik-s-projects-2e6c9cbc`. Reauthorize the proper team in Vercel, then import the repository. The account is presently on Hobby; commercial deployment requires a commercial-eligible plan.
- **Supabase NOT configured:** Create a separate database for this app; no authentication or CRM data will work independently until it is set up.
- **Live Floot app stays online:** https://aimad-studio-os.floot.app — do not unpublish until the new version passes full authentication and CRUD tests.
- **Database records:** A read-only check found zero leads/quotes/projects at migration preparation time. Floot logins/passwords are not transferable to Supabase Auth.

## Step A — GitHub repository (completed; review visibility)

The source is already committed to https://github.com/Karthi7170/aimad-studio-os and GitHub Actions builds it. **The repository is currently PUBLIC.** For internal business source, consider changing it to **private** under GitHub repository Settings → General → Danger Zone → Change repository visibility. To clone locally:

```sh
git clone https://github.com/Karthi7170/aimad-studio-os.git
```

All code and icons are present in the GitHub repository. Never upload `.env.local`, `.vercel/` or `node_modules/`.

## Step B — Dedicated Supabase project

Create a **new** Supabase project for Studio OS in your chosen organization. Do not reuse the existing VIP-Hunter or GCS databases. In its SQL Editor apply `supabase/migrations/20261014_studio_os.sql` only once. Verify table RLS is ON and policies use `auth.uid() = user_id`. Invite the studio owner to Supabase Auth; do not expose public registration unless needed. Configure the project Site URL and auth redirect allowlist to match the Vercel domain. Invite/reset passwords rather than attempting to copy Floot's password hashes.

## Step C — Import in Vercel

Reconnect Vercel with access to the right team if needed. Use **Add New → Project → Import Git Repository**, choose `Karthi7170/aimad-studio-os`, framework **Next.js**, root `/`. For a commercial business app use a commercial-eligible Vercel plan. Add environment variables in Vercel (not in GitHub):

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_PUBLIC_KEY
```

These are client-safe public values; never add a Supabase service-role or secret key to NEXT_PUBLIC variables. Deploy first to a preview URL; only promote to production after tests.

## Step D — Acceptance checks

1. `npm install && npm run check:syntax && npm run check:security && npm run typecheck && npm run build` succeeds in CI.
2. Unauthenticated `/` redirects to `/login`; unauthenticated database access returns no records.
3. Password recovery email and redirect URLs work on the new domain.
4. After signing in, create one **real or clearly labeled test** lead, reload, change its status, then delete it.
5. Create a quotation draft; check amount, copy text, reload persistence, and delete it.
6. Create and move a project through stages, check it persists across sign-outs.
7. On iPhone 17 Safari: check 5-tab bottom nav, More sheet, keyboard and safe areas; install via Share → Add to Home Screen.
8. Verify owner-based access isolation with a second account, if team access is enabled.
9. Only then redirect users and optionally unpublish Floot. Keep a database backup and recovery plan.

## Operational limitations

This is a manual-outreach studio CRM. AI calls, WhatsApp sending, automatic lead discovery, GitHub PR sync and Vercel deployment triggers remain integration placeholders. A source-code migration does not make them operational.