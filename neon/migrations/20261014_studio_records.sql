-- AI x MAD Studio OS | Neon Postgres | private server-side API only
-- New database only: no live project data affected.
CREATE TABLE IF NOT EXISTS public.studio_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('lead','proposal','project')),
  data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS studio_records_owner_kind_created_idx
  ON public.studio_records(user_id, kind, created_at DESC);
ALTER TABLE public.studio_records ENABLE ROW LEVEL SECURITY;
-- Keep Neon Data API disabled for this database. Studio OS uses a server-only
-- Neon database role with explicit user_id predicates on every operation.
REVOKE ALL ON public.studio_records FROM PUBLIC;
COMMENT ON TABLE public.studio_records IS
  'Owner-filtered private CRM, quotations, and projects. Access exclusively from Studio OS server routes.';
