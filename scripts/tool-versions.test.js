// `.node-version` and `.bun-version` are the single source of truth for the
// Node/Bun versions (CI reads them in `resolve_versions`, like backtemplate).
// These checks keep every other place that repeats a version in sync.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const root = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const nodeVersion = read('.node-version').trim();
const bunVersion = read('.bun-version').trim();
const pkg = JSON.parse(read('package.json'));

test('version files hold exact semver versions', () => {
  assert.match(nodeVersion, /^\d+\.\d+\.\d+$/);
  assert.match(bunVersion, /^\d+\.\d+\.\d+$/);
});

test('package.json packageManager pins the .bun-version Bun', () => {
  assert.equal(pkg.packageManager, `bun@${bunVersion}`);
});

test('package.json engines.node requires the .node-version Node', () => {
  assert.equal(pkg.engines.node, `>=${nodeVersion}`);
});

test('Dockerfile default BUN_VERSION matches .bun-version', () => {
  assert.match(
    read('Dockerfile'),
    new RegExp(`^ARG BUN_VERSION=${bunVersion.replaceAll('.', '\\.')}$`, 'm'),
  );
  assert.doesNotMatch(
    read('Dockerfile'),
    /oven\/bun:\d/,
    'use oven/bun:${BUN_VERSION}, not a literal tag',
  );
});
