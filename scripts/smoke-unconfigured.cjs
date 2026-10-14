/* Fail-closed smoke test. Runs built Next.js with all backend secrets omitted.
 * Does not touch Neon, deploy anything or store test data.
 */
const { spawn } = require('node:child_process');
const path = require('node:path');
const assert = require('node:assert/strict');

const port = 38149;
const origin = `http://127.0.0.1:${port}`;
const env = { ...process.env };
for (const key of [
  'DATABASE_URL',
  'NEON_AUTH_BASE_URL',
  'NEON_AUTH_COOKIE_SECRET',
  'STUDIO_OWNER_EMAIL',
]) delete env[key];

const child = spawn(process.execPath, [
  path.join(process.cwd(), 'node_modules/next/dist/bin/next'),
  'start', '--port', String(port), '--hostname', '127.0.0.1',
], { env, stdio: ['ignore', 'pipe', 'pipe'] });

let logs = '';
child.stdout.on('data', chunk => { logs += chunk.toString(); });
child.stderr.on('data', chunk => { logs += chunk.toString(); });

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitForServer() {
  for (let attempt = 0; attempt < 90; attempt++) {
    if (child.exitCode != null) throw new Error('Server exited prematurely: ' + logs.slice(-1400));
    try {
      const response = await fetch(origin + '/api/health');
      if (response.status === 503) return;
    } catch {}
    await delay(250);
  }
  throw new Error('Server startup timed out: ' + logs.slice(-1400));
}
async function main() {
  await waitForServer();
  const scenarios = [
    { path: '/', status: 200, match: 'Neon backend is ready' },
    { path: '/login', status: 200, match: 'Welcome back' },
    { path: '/api/health', status: 503, match: 'configuration-required' },
    { path: '/api/studio', status: 503, match: 'not configured' },
  ];
  for (const { path, status, match } of scenarios) {
    const response = await fetch(origin + path, { redirect: 'manual' });
    const body = await response.text();
    assert.equal(response.status, status, `${path} should be HTTP ${status}; actual ${response.status}`);
    assert.ok(body.includes(match), `${path} should contain "${match}"`);
    console.log('PASS', path, 'HTTP', status);
  }
  const post = await fetch(origin + '/api/studio', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin },
    body: JSON.stringify({ action: 'create', kind: 'lead', data: {} }),
  });
  assert.equal(post.status, 503, 'Unauthenticated write must fail closed');
  console.log('PASS /api/studio POST HTTP', post.status);
}
main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => {
  child.kill('SIGTERM');
});
