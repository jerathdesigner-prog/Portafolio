// Loaded by @angular/build:unit-test through the `runnerConfig` option in angular.json.
// Written without ESM syntax on purpose: package.json has no "type": "module", so Vite
// loads this file as CommonJS and warns on import/export statements.
module.exports = {
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
