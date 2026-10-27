const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const {
  isWarmupEnabled,
  readDevServerPort,
  resolveWarmupFile,
} = require('./serve.js');

const root = path.join(__dirname, '..');

test('warm-up is on by default and off with NG_DEV_WARMUP=0/false', () => {
  assert.equal(isWarmupEnabled({}), true);
  assert.equal(isWarmupEnabled({ NG_DEV_WARMUP: '1' }), true);
  assert.equal(isWarmupEnabled({ NG_DEV_WARMUP: '0' }), false);
  assert.equal(isWarmupEnabled({ NG_DEV_WARMUP: 'FALSE' }), false);
});

test('readDevServerPort reads the serve-original port, not the federation one', () => {
  const angularJson = JSON.parse(
    fs.readFileSync(path.join(root, 'angular.json'), 'utf8'),
  );
  const port = readDevServerPort(angularJson);

  assert.equal(typeof port, 'number');
  assert.notEqual(port, 0);
});

test('readDevServerPort fails without a serve-original port', () => {
  assert.throws(
    () => readDevServerPort({ projects: { app: { architect: {} } } }),
    /serve-original/,
  );
});

test('resolveWarmupFile returns an existing exposed source file', async () => {
  const file = await resolveWarmupFile(root);

  assert.ok(fs.existsSync(file), file);
  assert.match(file, /\.ts$/);
  // Not the fallback: the first `exposes` entry (normalized to `{ file }`) was used.
  assert.notEqual(file, path.join(root, 'src/main.ts'));
});

test('resolveWarmupFile falls back to src/main.ts without a federation config', async () => {
  const file = await resolveWarmupFile(path.join(root, 'scripts'));

  assert.equal(file, path.join(root, 'scripts', 'src/main.ts'));
});
