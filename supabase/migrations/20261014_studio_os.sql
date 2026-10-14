-- AI x MAD Studio OS: isolated private workspace. Apply in a NEW Supabase project.
-- No destructive statements and no data is copied from other projects.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS public.studio_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  kind text NOT NULL CHECK (kind IN ('lead', 'proposal', 'project')),
  data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS studio_records_user_kind_created_idx ON public.studio_records (user_id, kind, created_at DESC);
ALTER TABLE public.studio_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "studio_select_own" ON public.studio_records FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);
CREATE POLICY "studio_insert_own" ON public.studio_records FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "studio_update_own" ON public.studio_records FOR UPDATE TO authenticated USING ((select auth.uid()) = user_id) WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "studio_delete_own" ON public.studio_records FOR DELETE TO authenticated USING ((select auth.uid()) = user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.studio_records TO authenticated;
REVOKE ALL ON public.studio_records FROM anon;
COMMENT ON TABLE public.studio_records IS 'Owner-isolated studio leads, quotations, and client projects. Row-level security mandatory.';
