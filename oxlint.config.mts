import { defineConfig } from 'oxlint';

// Linter of this repo (replaces Biome).
// Docs: https://oxc.rs/docs/guide/usage/linter/config.html
export default defineConfig({
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
});
