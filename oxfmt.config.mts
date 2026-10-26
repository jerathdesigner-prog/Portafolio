import { defineConfig } from 'oxfmt';

// Formatter of this repo (replaces Biome). Prettier-compatible output.
// Docs: https://oxc.rs/docs/guide/usage/formatter/config.html
export default defineConfig({
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
});
