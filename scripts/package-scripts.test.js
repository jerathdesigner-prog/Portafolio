// Script names describe what they do, not the tool behind them, and never
// shadow a Bun built-in: with a `check` script, `bun check` runs the script
// instead of Bun's own type checker.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const { scripts } = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'),
);

test('format, format:check and verify run the Oxc formatter and linter', () => {
  assert.equal(scripts.format, 'oxfmt');
  assert.equal(scripts['format:check'], 'oxfmt --check');
  assert.equal(scripts.verify, 'oxlint --deny-warnings && oxfmt --check');
});

test('no script shadows `bun check` or carries the tool name', () => {
  assert.ok(!('check' in scripts), 'a `check` script hides `bun check`');
  for (const name of Object.keys(scripts)) {
    assert.doesNotMatch(name, /^oxc:/, `tool-specific script name: ${name}`);
  }
});
