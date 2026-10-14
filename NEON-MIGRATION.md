# Neon backend migration — AI x MAD Studio OS
Neon project: `hidden-cherry-39169820`, region Singapore (`aws-ap-southeast-1`), database `studio_os`, main branch.
Managed Better Auth is provisioned. The `public.studio_records` table is created with RLS enabled and public privileges revoked.
The application uses a **server-side API** for database CRUD and verifies session identity and `STUDIO_OWNER_EMAIL` on every request.
Do not enable Neon Data API on this project unless appropriate grants and RLS policies are set up. No client-side Postgres credentials are used.

## Vercel environment variables
```
DATABASE_URL=(copy from Neon Console > Connect, pooled or direct for serverless HTTP)
NEON_AUTH_BASE_URL=(copy Neon Auth URL, with /studio_os/auth)
NEON_AUTH_COOKIE_SECRET=(generate an independent 32+ character random secret)
STUDIO_OWNER_EMAIL=OWNER_EMAIL@example.com
```
Never paste production DATABASE_URL or NEON_AUTH_COOKIE_SECRET into GitHub or chat.
The previous Supabase migration file is obsolete and should not be applied to Neon.
The legacy Floot app remains online until production sign-in and CRUD have been tested.

## Sign in
Use Google OAuth to sign in with the authorized owner email; shared Google OAuth is enabled in Neon for testing.
Add the final Vercel domain as a trusted Neon Auth redirect origin. Google shared OAuth may be restricted to development use; verify Neon Auth provider settings before production.
No public registration form is exposed in Studio OS. Even if a different identity signs in to Neon Auth, the dashboard and all CRM API routes reject users not matching STUDIO_OWNER_EMAIL.

## Vercel deployment status
The previously connected Vercel team denies API access (HTTP 403). Reauthorize correct scope in ChatGPT's Vercel connection or import manually at https://vercel.com/new.
Use a commercial-eligible hosting plan if this is a business deployment. The Vercel Hobby plan is non-commercial.
