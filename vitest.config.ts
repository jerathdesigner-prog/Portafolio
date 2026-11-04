// Loaded by @angular/build:unit-test through the `runnerConfig` option in angular.json.
// No import/export statements on purpose: package.json has no "type": "module", so Vite
// loads this file as CommonJS and warns on any ESM statement, even `import type`.
// The inline `import()` type below is not a statement: it only types the object with
// the same `ViteUserConfig` that `defineConfig()` accepts (autocompletion and checks).
const config: import('vitest/config').ViteUserConfig = {
  test: {
    server: {
      deps: {
        // @neocore/lib-components (used by most forks) ships ESM that imports
        // `dayjs/locale/es` without an extension; Node's strict ESM loader
        // rejects that, so let Vite transform it.
        inline: ['@neocore/lib-components'],
      },
    },
  },
};

module.exports = config;
