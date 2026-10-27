// Loaded by @angular/build:unit-test through the `runnerConfig` option in angular.json.
// CommonJS export on purpose: package.json has no "type": "module", so Vite loads this
// file as CommonJS and warns on ESM import/export. `import type` is erased at compile
// time, so it adds the editor/type-check hints without leaving ESM behind.
import type { ViteUserConfig } from 'vitest/config';

// Same type `defineConfig()` accepts: autocompletion and checks for every option.
const config: ViteUserConfig = {
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
