/* Offline TypeScript/TSX syntax check; full compilation still requires dependencies. */
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const excluded = new Set(['node_modules', '.next', '.git', '.vercel']);
const files = [];
function visit(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (excluded.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) visit(full);
    else if (/\.(ts|tsx)$/.test(entry.name)) files.push(full);
  }
}
visit(root);
let problems = 0;
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const kind = file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, kind);
  for (const diag of sf.parseDiagnostics) {
    const loc = sf.getLineAndCharacterOfPosition(diag.start ?? 0);
    console.error(`${path.relative(root, file)}:${loc.line + 1}:${loc.character + 1}: ${ts.flattenDiagnosticMessageText(diag.messageText, ' ')}`);
    problems += 1;
  }
}
if (problems) process.exitCode = 1;
else console.log(`Syntax check passed: ${files.length} TypeScript/TSX files`);
