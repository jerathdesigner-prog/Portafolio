// Dev server entry point (`bun start`): runs `ng serve` and, once the server
// answers, warms Angular's incremental compiler in the background.
//
// Why: the FIRST rebuild after `ng serve` starts re-emits and re-type-checks the
// whole program (NG_EMIT_TS + diagnostics, ~13s in a large remote, ~25s together
// with the Native Federation rebuild); every later rebuild takes ~1.5s. Touching
// one exposed source file right after startup pays that cost while nobody is
// waiting, so the first real save is already incremental.
// Set NG_DEV_WARMUP=0 to skip it.

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawn } = require('node:child_process');

const root = path.join(__dirname, '..');
const POLL_INTERVAL_MS = 1000;
const READY_TIMEOUT_MS = 10 * 60 * 1000;
const FALLBACK_WARMUP_FILE = 'src/main.ts';

function isWarmupEnabled(env = process.env) {
  const value = env.NG_DEV_WARMUP;
  return value === undefined || !['0', 'false'].includes(value.toLowerCase());
}

// Port of the real Angular dev server (`serve-original`); the federation `serve`
// target itself runs on port 0.
function readDevServerPort(angularJson) {
  for (const project of Object.values(angularJson.projects)) {
    const port = project.architect?.['serve-original']?.options?.port;
    if (port) return port;
  }
  throw new Error('No serve-original port in angular.json');
}

// First exposed module: it belongs to both the app and the federation build,
// so touching it warms both compilers.
async function resolveWarmupFile(projectRoot = root) {
  try {
    const configUrl = pathToFileURL(path.join(projectRoot, 'federation.config.mjs')).href;
    const { default: config } = await import(configUrl);
    // withNativeFederation() normalizes each expose to `{ file }`.
    const [firstExposed] = Object.values(config.exposes ?? {});
    const file = typeof firstExposed === 'string' ? firstExposed : firstExposed?.file;
    if (file && fs.existsSync(path.join(projectRoot, file))) {
      return path.join(projectRoot, file);
    }
  } catch {
    // fall through to the fallback file
  }
  return path.join(projectRoot, FALLBACK_WARMUP_FILE);
}

function isServerUp(port) {
  return new Promise((resolve) => {
    const request = http.get(
      { host: 'localhost', port, path: '/', timeout: POLL_INTERVAL_MS },
      (res) => {
        res.resume();
        resolve(true);
      },
    );
    request.on('error', () => resolve(false));
    request.on('timeout', () => {
      request.destroy();
      resolve(false);
    });
  });
}

async function waitForServer(port, isAlive, timeoutMs = READY_TIMEOUT_MS) {
  const deadline = Date.now() + timeoutMs;
  while (isAlive() && Date.now() < deadline) {
    if (await isServerUp(port)) return true;
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }
  return false;
}

// mtime-only touch: the content never changes, but the watcher still rebuilds.
function touch(file) {
  const now = new Date();
  fs.utimesSync(file, now, now);
}

async function warmUp(port, isAlive) {
  if (!(await waitForServer(port, isAlive))) return;
  const file = await resolveWarmupFile();
  touch(file);
  console.info(`[serve] Warming up the incremental build (${path.relative(root, file)}).`);
}

function main() {
  const ngBin = path.join(root, 'node_modules', '@angular', 'cli', 'bin', 'ng.js');
  // process.execArgv keeps node flags such as --stack-size from package.json.
  const child = spawn(
    process.execPath,
    [...process.execArgv, ngBin, 'serve', ...process.argv.slice(2)],
    {
      cwd: root,
      stdio: 'inherit',
    },
  );
  let alive = true;
  child.on('exit', (code, signal) => {
    alive = false;
    process.exit(code ?? (signal ? 1 : 0));
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, () => child.kill(signal));
  }

  if (isWarmupEnabled()) {
    const angularJson = JSON.parse(fs.readFileSync(path.join(root, 'angular.json'), 'utf8'));
    warmUp(readDevServerPort(angularJson), () => alive).catch((error) => {
      console.warn(`[serve] Warm-up skipped: ${error.message}`);
    });
  }
}

if (require.main === module) {
  main();
}

module.exports = { isWarmupEnabled, readDevServerPort, resolveWarmupFile };
