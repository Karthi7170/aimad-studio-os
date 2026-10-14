/* Source-level security invariants. These do not replace a live Supabase audit. */
const fs = require('node:fs');
function read(p) { return fs.readFileSync(p, 'utf8'); }
const sql = read('supabase/migrations/20261014_studio_os.sql').toLowerCase();
const files = ['app/page.tsx','app/login/page.tsx','app/reset-password/page.tsx',
  'app/auth/callback/route.ts','components/Dashboard.tsx',
  'lib/supabase/client.ts','lib/supabase/server.ts','proxy.ts'];
const code = files.map(read).join('\n');
const checks = {
  'RLS enabled': /alter table public\.studio_records enable row level security/.test(sql),
  'Owner-scoped SELECT': /for select to authenticated using\s*\(\s*\(select auth\.uid\(\)\)\s*=\s*user_id\s*\)/.test(sql),
  'Owner-scoped UPDATE WITH CHECK': /for update to authenticated using[\s\S]*?with check\s*\(\s*\(select auth\.uid\(\)\)\s*=\s*user_id\s*\)/.test(sql),
  'Owner-scoped INSERT': /for insert to authenticated with check/.test(sql),
  'Anonymous role revoked': /revoke all on public\.studio_records from anon/.test(sql),
  'No service role in client': !/service.role|service_role|sb_secret_|supabase_service_role_key/i.test(code),
  'Auth gate on dashboard': code.includes("supabase.auth.getClaims()") && code.includes("redirect('/login')"),
  'No Floot imports': !/from ['"]@floot\//i.test(code),
};
const failed = Object.entries(checks).filter(([,good]) => !good).map(([name])=>name);
for (const [name,good] of Object.entries(checks)) console.log(`${good?'PASS':'FAIL'} ${name}`);
if(failed.length) process.exit(1);
console.log('Security source checks passed (live configuration still requires review).');
