import { redirect } from 'next/navigation';
import { configured } from '@/lib/supabase/config';
import { serverSupabase } from '@/lib/supabase/server';
import Dashboard from '@/components/Dashboard';
export const dynamic = 'force-dynamic';
export default async function Home() {
  if (!configured()) {
    return <main className="setup-screen"><div className="setup-card"><div className="brandLogo">AI × MAD</div><div className="mini">INDEPENDENT WEB APP</div><h1>Studio OS is ready to configure.</h1><p>This independent GitHub + Vercel build is prepared, but requires a dedicated Supabase project before live CRM and sign-in can operate.</p><p>Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> in Vercel, apply the SQL migration, and redeploy.</p></div></main>;
  }
  const supabase = await serverSupabase();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) redirect('/login');
  return <Dashboard userId={data.claims.sub} />;
}
