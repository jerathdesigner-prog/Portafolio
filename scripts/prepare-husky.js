// Git hooks bootstrap. Chained from `prepare.js` (skipped in CI).
//
// Points `core.hooksPath` at husky; the hooks themselves (`.husky/pre-commit`)
// are tracked in the repo. Best-effort: a missing git or a failing husky never
// breaks `bun install`.

const { execSync } = require('node:child_process');
const path = require('node:path');

const root = path.join(__dirname, '..');

function run(cmd, stdio = 'ignore') {
  try {
    execSync(cmd, { cwd: root, stdio });
    return true;
  } catch {
    return false;
  }
}

if (!run('git --version')) {
  console.info('[prepare-husky] git not found: skipping husky install');
  process.exit(0);
}

// Repo-scoped rerere: re-merging the same branch does not re-ask for
// conflicts already resolved in this clone.
run('git config rerere.enabled true');

try {
  execSync(path.join('node_modules', '.bin', 'husky'), { cwd: root, stdio: 'inherit' });
} catch (error) {
  console.error('[prepare-husky] husky install failed:', error.message);
}
