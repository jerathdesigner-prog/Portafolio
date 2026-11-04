import type { OxlintConfig } from 'oxlint';

// Linter of this repo (replaces Biome).
// Docs: https://oxc.rs/docs/guide/usage/linter/config.html
const config: OxlintConfig = {
  categories: {
    correctness: 'error',
    suspicious: 'warn',
  },
  env: { browser: true, es2024: true },
  ignorePatterns: [
    'dist/**',
    'coverage/**',
    'build/**',
    '.angular/**',
    'odd/**',
    'src/environments/**',
    // Fork legacy code migrated as-is (Cloudflare Worker, admin panel, scripts).
    'worker/**',
    'public/static/**',
    'tests/**',
    'tools/**',
    'src/app/modules/portfolio/legacy/**',
    'src/styles/portfolio.css',
    'src/app/modules/portfolio/pages/portfolio-home/portfolio-home.page.html',
  ],
  // Same sorting as backtemplate's Biome assist actions (useSortedKeys,
  // useSortedInterfaceMembers). Oxc has no interface-member sorter, so it comes
  // from eslint-plugin-perfectionist through oxlint's JS plugin support.
  jsPlugins: ['eslint-plugin-perfectionist'],
  overrides: [
    {
      env: { node: true },
      files: ['scripts/**', '*.js', '*.mjs', '*.cjs'],
    },
  ],
  plugins: ['typescript', 'unicorn', 'oxc', 'import', 'vitest'],
  rules: {
    // Side-effect imports hide what a module needs; the Temporal polyfill is
    // the one exception (exposed entries install it, see template.routes.ts).
    'import/no-unassigned-import': [
      'warn',
      { allow: ['temporal-polyfill/global'] },
    ],
    // Dates use Temporal (polyfilled by `temporal-polyfill/global`), never the
    // legacy Date: mutable, month-zero-based and timezone-ambiguous.
    'no-restricted-globals': [
      'error',
      { message: 'Use Temporal instead of Date.', name: 'Date' },
    ],
    // Biome useSortedInterfaceMembers: interface members in natural order (autofix).
    'perfectionist/sort-interfaces': ['error', { type: 'natural' }],
    // Biome useSortedKeys: object literal keys in natural order (autofix).
    'sort-keys': ['error', 'asc', { natural: true }],
    // Angular components/services are classes whose members can all live in
    // decorators (e.g. the root `App` component): not dead code.
    'typescript/no-extraneous-class': 'off',
  },
};

// CommonJS export: package.json has no "type": "module" (the repo scripts are
// CommonJS), so an ESM `export default` makes Node re-parse this file with a
// MODULE_TYPELESS_PACKAGE_JSON warning on every lint/format run. `import type`
// above is erased by Node's type stripping, so the file stays plain CommonJS.
module.exports = config;
