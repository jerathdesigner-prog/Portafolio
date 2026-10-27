import type { OxfmtConfig } from 'oxfmt';

// Formatter of this repo (replaces Biome). Prettier-compatible output.
// Docs: https://oxc.rs/docs/guide/usage/formatter/config.html
const config: OxfmtConfig = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  semi: true,
  trailingComma: 'all',
  arrowParens: 'always',
  bracketSpacing: true,
  // Same behavior Biome had with `organizeImports`.
  sortImports: true,
  // Angular templates: format `.html` with the Angular template parser.
  associations: [{ files: ['src/**/*.html'], language: 'angular-html' }],
  ignorePatterns: [
    'dist/**',
    'coverage/**',
    'build/**',
    '.angular/**',
    '.vscode/**',
    'odd/**',
    'src/environments/**',
    // Rewritten by scripts/generate-module.js (JSON.stringify layout).
    'tsconfig.federation.json',
    // Hand-written docs: padding Markdown tables only adds noise.
    '**/*.md',
  ],
};

// CommonJS export: package.json has no "type": "module" (the repo scripts are
// CommonJS), so an ESM `export default` makes Node re-parse this file with a
// MODULE_TYPELESS_PACKAGE_JSON warning on every lint/format run. `import type`
// above is erased by Node's type stripping, so the file stays plain CommonJS.
module.exports = config;
