import type { OxlintConfig } from 'oxlint';

// Linter of this repo (replaces Biome).
// Docs: https://oxc.rs/docs/guide/usage/linter/config.html
const config: OxlintConfig = {
  plugins: ['typescript', 'unicorn', 'oxc', 'import', 'vitest'],
  env: { browser: true, es2024: true },
  categories: {
    correctness: 'error',
    suspicious: 'warn',
  },
  rules: {
    // Angular components/services are classes whose members can all live in
    // decorators (e.g. the root `App` component): not dead code.
    'typescript/no-extraneous-class': 'off',
  },
  ignorePatterns: [
    'dist/**',
    'coverage/**',
    'build/**',
    '.angular/**',
    'odd/**',
    'src/environments/**',
  ],
  overrides: [
    {
      files: ['scripts/**', '*.js', '*.mjs', '*.cjs'],
      env: { node: true },
    },
  ],
};

// CommonJS export: package.json has no "type": "module" (the repo scripts are
// CommonJS), so an ESM `export default` makes Node re-parse this file with a
// MODULE_TYPELESS_PACKAGE_JSON warning on every lint/format run. `import type`
// above is erased by Node's type stripping, so the file stays plain CommonJS.
module.exports = config;
