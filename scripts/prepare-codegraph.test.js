// prepare-codegraph.js runs on every local `bun install`: it must index once,
// skip when an index exists, and never fail the install.
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const SCRIPT = path.join(__dirname, 'prepare-codegraph.js');

// A throwaway repo: scripts/prepare-codegraph.js, a versioned
// .codegraph/.gitignore and, optionally, a fake CodeGraph shim that records its
// arguments and environment, then exits with `shimExit`.
function sandbox({ shimExit } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prepare-codegraph-'));
  fs.mkdirSync(path.join(dir, 'scripts'));
  fs.copyFileSync(SCRIPT, path.join(dir, 'scripts/prepare-codegraph.js'));
  fs.mkdirSync(path.join(dir, '.codegraph'));
  fs.writeFileSync(path.join(dir, '.codegraph/.gitignore'), '*\n!.gitignore\n');
  if (shimExit !== undefined) {
    const shimDir = path.join(dir, 'node_modules/@colbymchenry/codegraph');
    fs.mkdirSync(shimDir, { recursive: true });
    fs.writeFileSync(
      path.join(shimDir, 'npm-shim.js'),
      `const fs = require('node:fs');
fs.writeFileSync(${JSON.stringify(path.join(dir, 'shim-call.json'))}, JSON.stringify({
  args: process.argv.slice(2),
  telemetry: process.env.CODEGRAPH_TELEMETRY,
}));
if (${shimExit} === 0) fs.writeFileSync('.codegraph/codegraph.db', 'db');
else fs.writeFileSync('.codegraph/partial.tmp', 'half');
process.exit(${shimExit});
`,
    );
  }
  return dir;
}

function run(dir) {
  return spawnSync(process.execPath, ['scripts/prepare-codegraph.js'], {
    cwd: dir,
    encoding: 'utf8',
  });
}

const shimCall = (dir) => {
  const file = path.join(dir, 'shim-call.json');
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
};

test('first install indexes once with telemetry off', () => {
  const dir = sandbox({ shimExit: 0 });
  try {
    const result = run(dir);
    assert.equal(result.status, 0);
    assert.deepEqual(shimCall(dir), { args: ['init', '-y'], telemetry: '0' });
    assert.ok(fs.existsSync(path.join(dir, '.codegraph/codegraph.db')));
    assert.ok(!fs.existsSync(path.join(dir, '.codegraph/.prepare-pending')));
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('an existing index is not rebuilt', () => {
  const dir = sandbox({ shimExit: 0 });
  try {
    fs.writeFileSync(path.join(dir, '.codegraph/codegraph.db'), 'existing');
    const result = run(dir);
    assert.equal(result.status, 0);
    assert.equal(shimCall(dir), null);
    assert.match(result.stdout, /already exists/);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('a failed index is cleaned up and never fails the install', () => {
  const dir = sandbox({ shimExit: 3 });
  try {
    const result = run(dir);
    assert.equal(result.status, 0);
    assert.match(result.stderr, /codegraph init failed/);
    assert.deepEqual(fs.readdirSync(path.join(dir, '.codegraph')), [
      '.gitignore',
    ]);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('without the package installed it warns and exits 0', () => {
  const dir = sandbox();
  try {
    const result = run(dir);
    assert.equal(result.status, 0);
    assert.match(result.stderr, /not installed/);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

test('a pending marker from a live run skips indexing', () => {
  const dir = sandbox({ shimExit: 0 });
  try {
    fs.writeFileSync(
      path.join(dir, '.codegraph/.prepare-pending'),
      JSON.stringify({ pid: process.pid }),
    );
    const result = run(dir);
    assert.equal(result.status, 0);
    assert.equal(shimCall(dir), null);
    assert.match(result.stdout, /another install is indexing/);
  } finally {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});
