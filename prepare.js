// `prepare` lifecycle entry point (`bun install`). These steps bootstrap the
// LOCAL development environment: git hooks (husky) and the local `.env`.
// CI gains nothing from them (an ephemeral checkout never commits, and the
// pipeline writes `.env` itself), so they are skipped when `CI` is set, or
// in any other non-interactive context with `SKIP_PREPARE=1`.
//
// The cut lives here, not in `bun install --ignore-scripts`: that flag would
// also skip dependency postinstall scripts.
const { execSync } = require('node:child_process');

function isEnabled(name) {
  const value = process.env[name];
  return !!value && value !== '0' && value.toLowerCase() !== 'false';
}

if (isEnabled('CI') || isEnabled('SKIP_PREPARE')) {
  console.info('[prepare] CI detected — skipping local environment bootstrap (husky/env).');
  process.exit(0);
}

// Prefer `bun` (faster startup), fall back to `node`: the scripts are plain
// CommonJS and run the same on both.
function hasBun() {
  try {
    execSync('bun --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
const runner = hasBun() ? 'bun' : 'node';

// This file only orchestrates: each step lives in its own script, so it is
// easy to find and to run alone for debugging.
execSync(`${runner} scripts/prepare-husky.js`, { stdio: 'inherit' });
execSync(`${runner} scripts/prepare-env.js`, { stdio: 'inherit' });
