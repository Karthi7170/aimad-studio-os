import { redirect } from 'next/navigation';
import { configured, requireOwner } from '@/lib/auth/server';
import Dashboard from '@/components/Dashboard';
export const dynamic = 'force-dynamic';
export default async function Home() {
  if (!configured()) {
    return <main className="setup-screen"><div className="setup-card"><div className="brandLogo">AI × MAD</div><div className="mini">INDEPENDENT WEB APP</div><h1>Neon backend is ready.</h1><p>The dedicated Neon database and Managed Better Auth are provisioned. Hosting environment variables still need to be configured in Vercel to enable your private studio login.</p><p>Configure <code>DATABASE_URL</code>, <code>NEON_AUTH_BASE_URL</code>, <code>NEON_AUTH_COOKIE_SECRET</code> and <code>STUDIO_OWNER_EMAIL</code>, then redeploy.</p></div></main>;
  }
  const user = await requireOwner();
  if (!user) redirect('/login');
  return <Dashboard userId={user.id} />;
}
