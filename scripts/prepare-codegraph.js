// Indexes the repo with CodeGraph the first time `bun install` runs in a local
// clone (same script as backtemplate). Chained from `prepare.js`, which already
// skips everything in CI and with SKIP_PREPARE=1 (no indexing on ephemeral
// runners).
//
// - "Already indexed" means `.codegraph/codegraph.db` exists. The directory is
//   not enough: `.codegraph/.gitignore` is versioned, so it always exists.
// - A `.codegraph/.prepare-pending` marker holding this run's PID prevents two
//   concurrent indexings and detects interrupted runs (dead PID).
// - If indexing fails or is interrupted, everything in `.codegraph/` except its
//   `.gitignore` is removed so the next install retries.
// - CodeGraph telemetry is off (CODEGRAPH_TELEMETRY=0).
// - It never fails the install: any error is reported and the script exits 0.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const indexDir = path.join(root, '.codegraph');
const dbFile = path.join(indexDir, 'codegraph.db');
const pendingFile = path.join(indexDir, '.prepare-pending');
const shim = path.join(
  root,
  'node_modules',
  '@colbymchenry',
  'codegraph',
  'npm-shim.js',
);
const INIT_TIMEOUT_MS = 10 * 60 * 1000;

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return err.code === 'EPERM';
  }
}

function readPending(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

// Removes everything in `.codegraph/` except its versioned .gitignore.
function cleanIndex() {
  for (const entry of fs.readdirSync(indexDir)) {
    if (entry === '.gitignore') continue;
    fs.rmSync(path.join(indexDir, entry), { force: true, recursive: true });
  }
}

// Claims the indexing atomically. Returns false when another live run owns it.
// A marker left by a dead run is taken over through a rename (atomic: only one
// run can win the race for the stale marker).
function claimIndexing() {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      fs.writeFileSync(pendingFile, JSON.stringify({ pid: process.pid }), {
        flag: 'wx',
      });
      return true;
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
      const previous = readPending(pendingFile);
      if (previous && isAlive(previous.pid)) return false;
      const claimed = `${pendingFile}.${process.pid}`;
      try {
        fs.renameSync(pendingFile, claimed);
      } catch (renameError) {
        if (renameError.code === 'ENOENT') return false;
        throw renameError;
      }
      fs.rmSync(claimed, { force: true });
      cleanIndex();
    }
  }
  return false;
}

function index() {
  if (!fs.existsSync(shim)) {
    console.warn(
      '[prepare-codegraph] @colbymchenry/codegraph is not installed (install --production?) — skipping indexing.',
    );
    return;
  }

  if (fs.existsSync(dbFile) && !fs.existsSync(pendingFile)) {
    console.info(
      '[prepare-codegraph] the index already exists (.codegraph/codegraph.db) — not reindexing.',
    );
    return;
  }

  fs.mkdirSync(indexDir, { recursive: true });
  if (!claimIndexing()) {
    console.info(
      '[prepare-codegraph] another install is indexing this repo — skipping.',
    );
    return;
  }

  console.info(
    '[prepare-codegraph] first run: indexing the repo with CodeGraph (~1 min)...',
  );
  const result = spawnSync(process.execPath, [shim, 'init', '-y'], {
    cwd: root,
    env: { ...process.env, CODEGRAPH_TELEMETRY: '0' },
    stdio: 'inherit',
    timeout: INIT_TIMEOUT_MS,
  });

  if (!result.error && result.status === 0) {
    fs.rmSync(pendingFile, { force: true });
    return;
  }

  cleanIndex();
  const reason = result.error
    ? result.error.message
    : `exit code ${result.status}`;
  console.warn(
    `[prepare-codegraph] codegraph init failed (${reason}); the install continues and the next install retries. To retry now: node node_modules/@colbymchenry/codegraph/npm-shim.js init -y`,
  );
}

try {
  index();
} catch (err) {
  console.warn(
    `[prepare-codegraph] could not index (${err.message}); the install continues and the next install retries.`,
  );
}

process.exit(0);
