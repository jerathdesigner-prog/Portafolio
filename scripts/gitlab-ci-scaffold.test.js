// The committed `.gitlab-ci.yml` must be exactly what the scaffold generates
// for this repo: editing it by hand (instead of the template) fails here.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

const { derive, parseArgs, readConfig, render } = require('../scaffold/generate.js');

const root = path.join(__dirname, '..');

// The banner's "Regenerate:" line holds the service and overrides this repo
// was generated with, so a fork runs this same test without editing it.
test('.gitlab-ci.yml matches the scaffold output recorded in its banner', () => {
  const file = readConfig().files.find((entry) => entry.id === 'gitlab-ci');
  const committed = fs.readFileSync(path.join(root, file.output), 'utf8').replace(/\r\n/g, '\n');
  const command = committed.match(/^# Regenerate: (node scaffold\/generate\.js .+)$/m);
  assert.ok(command, `${file.output} has no generated banner: run node scaffold/generate.js`);

  const { service, target, force: _force, ...overrides } = parseArgs(command[1].split(' '));
  assert.equal(
    committed,
    render(file, service, target, overrides),
    `Edit scaffold/templates/gitlab-ci.yml, then run: ${command[1]}`,
  );
});

test('derive builds every token from the service name', () => {
  const tokens = derive('mf-virtual-office', readConfig().shared);

  assert.equal(tokens.SERVICE_NAME, 'mf-virtual-office');
  assert.equal(tokens.CONTAINER_NAME, 'mf-virtual-office');
  assert.equal(tokens.COMPOSE_IMAGE_VAR, 'FRONT_VIRTUAL_OFFICE_IMAGE_COMMIT');
  assert.match(tokens.COMPOSE_FILE_DEV, /\/mf-virtual-office\.yml$/);
  assert.match(tokens.COMPOSE_FILE_QA, /\/mf-virtual-office\.yml$/);
  assert.match(tokens.COMPOSE_FILE_PREPROD, /\/mf-virtual-office\.yml$/);
});

test('render records overrides in the regenerate command', () => {
  const file = readConfig().files.find((entry) => entry.id === 'gitlab-ci');
  const output = render(file, 'mf-container', '.', { 'service-name': 'container' });

  assert.match(
    output,
    /^# Regenerate: node scaffold\/generate\.js --service=mf-container --target=\. --service-name=container --force$/m,
  );
  assert.match(output, /SERVICE_NAME: 'container'/);
});

test('derive applies explicit overrides for repos that deviate', () => {
  const tokens = derive('mf-container', readConfig().shared, {
    'service-name': 'container',
    'compose-base-dev': '/srv/docker',
  });

  assert.equal(tokens.SERVICE_NAME, 'container');
  assert.equal(tokens.CONTAINER_NAME, 'mf-container');
  assert.equal(tokens.COMPOSE_FILE_DEV, '/srv/docker/mf-container.yml');
});

test('derive rejects a service without the mf- prefix', () => {
  assert.throws(() => derive('template', readConfig().shared), /must start with "mf-"/);
});

test('every template token is resolved', () => {
  const file = readConfig().files.find((entry) => entry.id === 'gitlab-ci');
  const tokens = Object.keys(derive('mf-template', readConfig().shared));
  const output = render(file, 'mf-template', '.');

  for (const token of tokens) {
    assert.ok(!output.includes(`{{${token}}}`), `unresolved {{${token}}}`);
  }
});

test('extra env keys become lines of the build_app .env heredoc', () => {
  const file = readConfig().files.find((entry) => entry.id === 'gitlab-ci');
  const output = render(file, 'mf-zoho', '.', { 'extra-env-keys': 'ZOHO_URL,ZOHO_ORG_ID' });

  assert.match(
    output,
    /\n {6}SECRET_KEY=\$SECRET_KEY\n {6}ZOHO_URL=\$ZOHO_URL\n {6}ZOHO_ORG_ID=\$ZOHO_ORG_ID\n {6}EOF\n/,
  );
  assert.match(output, /--extra-env-keys=ZOHO_URL,ZOHO_ORG_ID --force$/m);
});

test('without extra env keys the heredoc keeps only the base variables', () => {
  const file = readConfig().files.find((entry) => entry.id === 'gitlab-ci');
  const output = render(file, 'mf-template', '.');

  assert.match(output, /\n {6}SECRET_KEY=\$SECRET_KEY\n {6}EOF\n/);
  assert.ok(!output.includes('EXTRA_ENV_LINES'));
});

test('derive rejects invalid or duplicated extra env keys', () => {
  const { shared } = readConfig();

  assert.throws(
    () => derive('mf-zoho', shared, { 'extra-env-keys': 'zoho-url' }),
    /invalid extra env key "zoho-url"/,
  );
  assert.throws(
    () => derive('mf-zoho', shared, { 'extra-env-keys': 'API_URL' }),
    /"API_URL" is already written/,
  );
  assert.throws(
    () => derive('mf-zoho', shared, { 'extra-env-keys': 'A_KEY,A_KEY' }),
    /duplicated extra env key "A_KEY"/,
  );
});
