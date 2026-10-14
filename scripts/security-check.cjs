/* Source-level safeguards. Live security still requires a deployed authentication test. */
const fs = require('node:fs');
function read(path) { return fs.readFileSync(path, 'utf8'); }
const migration = read('neon/migrations/20261014_studio_records.sql').toLowerCase();
const dashboard = read('components/Dashboard.tsx');
const app = read('app/page.tsx');
const api = read('app/api/studio/route.ts');
const auth = read('lib/auth/server.ts');
const db = read('lib/db.ts');
const browser = read('lib/auth/client.ts');
const login = read('app/login/page.tsx');
const checks = {
  'RLS enabled': /alter table public\.studio_records enable row level security/.test(migration),
  'Public privileges revoked': /revoke all on public\.studio_records from public/.test(migration),
  'Verified owner email required': auth.includes('session.user.emailVerified !== true') && auth.includes('session.user.email.toLowerCase() !== expected'),
  'Dashboard requires owner': app.includes('await requireOwner()') && app.includes("redirect('/login')"),
  'API actions require owner': api.includes('const auth=await owner()') && api.includes('requireOwner()'),
  'All SQL reads owner-filtered': api.includes('WHERE user_id=${auth.user!.id}'),
  'All SQL updates owner-filtered': api.includes('AND user_id=${userId}'),
  'Write requests same-origin': api.includes('origin!==new URL(request.url).origin'),
  'Secrets used only on server': db.includes('process.env.DATABASE_URL') && !browser.includes('DATABASE_URL') && !dashboard.includes('DATABASE_URL'),
  'No browser database access': !dashboard.includes('browserSupabase') && !/\.from\(/.test(dashboard),
  'No legacy Supabase': !/from ['"]@supabase\//.test(dashboard+app+api+auth+db+login),
  'No Floot dependencies': !/from ['"]@floot\//.test(dashboard+app+api+auth+db+login)
};
let failures=0;
for(const [name,ok] of Object.entries(checks)) {
 console.log(`${ok?'PASS':'FAIL'} ${name}`);
 if(!ok)failures++;
}
if(failures)process.exit(1);
console.log('Security source checks passed. Requires live acceptance tests after deployment.');
