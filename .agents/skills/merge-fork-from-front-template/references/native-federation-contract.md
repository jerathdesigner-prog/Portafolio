# Native Federation contract

The host `frontcontainer` loads this remote at runtime. Nothing in the fork's `app.config.ts` runs
when hosted; only the exposed entry (a `Routes` array or an NgModule) is imported. Keep the contract
below intact across merges.

## How the host loads a remote

At boot the host reads the manifest (ms-core in production; `src/assets/container.json` in local dev)
and builds one route per row:

```ts
[entry.typeRemote === 'module' ? 'loadChildren' : 'loadComponent']: () =>
  loadRemoteModule({
    remoteEntry: toRemoteEntryJson(entry.remoteEntry), // remoteEntry.js -> .json
    exposedModule: `./${entry.exposedModule}`,
  }).then((m) => m[entry.exposedModule])
```

Manifest row (one per exposed entry):

| Field           | Meaning                                                                                 |
| --------------- | --------------------------------------------------------------------------------------- |
| `name`          | Title / breadcrumb                                                                      |
| `remoteEntry`   | Public URL of this MF's `remoteEntry.json`                                              |
| `path`          | Route path in the host; the exposed routes are mounted under it                         |
| `exposedModule` | Exposed key **without** `./`, equal to the exported symbol                              |
| `isAuthRoute`   | `true` = authenticated layout + menu guard; `false` = public layout                     |
| `moduleName`    | Parent breadcrumb                                                                       |
| `typeRemote`    | `module` for `Routes`/NgModule (`loadChildren`), `component` for a standalone component |
| `guards`        | Guard names resolved by the host                                                        |

## Exposes

`federation.config.mjs`:

```js
exposes: {
  './TemplateRoutes': './src/app/modules/template/template.routes.ts',
},
```

- The key `./X` MUST equal the exported symbol `X` (`export const TemplateRoutes: Routes` or
  `export class XModule`). The host does `m[entry.exposedModule]`; a mismatch loads `undefined`
  and the route silently fails/404s.
- Every exposed file is listed in `tsconfig.federation.json` `files` (the federation build compiles
  only those entry points).
- `bun run generate:module -- --name=<name> --expose` edits both.
- Verify after the build: `dist/browser/remoteEntry.json` → `exposes[].key` / `outFileName`.

## Routes vs NgModule

- **Standalone `Routes`** (template style): export a `Routes` array; `federation.config.mjs` exposes
  the file. Use `loadComponent`/`loadChildren` for the feature.
- **NgModule** (legacy forks, e.g. the broker's `PublicPaymentModule`): export the NgModule. The host
  lazy-loads it through `loadChildren`; the module MUST use `RouterModule.forChild(routes)`.
  `RouterModule.forRoot()` inside an exposed module creates a second router/root guard and breaks
  the host (`NG0203`/duplicate forRoot guard).
- Neither style may provide `HttpClient`/`provideMfHttpClient()` in an exposed route/module. Hosted
  requests must go through the host's HttpClient and interceptors (auth, error, loader). Only the
  standalone-dev `app.config.ts` registers `provideMfHttpClient()`.

## `federation.config.mjs` policy

Keep the template's policy, changing only the fork's `name` and `exposes`:

```js
const strict = { singleton: true, strictVersion: true, requiredVersion: 'auto' };
const strictSecondary = { ...strict, includeSecondaries: true };

shared: {
  ...shareAll(strict, {
    overrides: {
      '@angular/common': strictSecondary,
      '@angular/platform-browser': strictSecondary,
      rxjs: strictSecondary,
    },
  }),
},
skip: [
  'rxjs/ajax', 'rxjs/fetch', 'rxjs/testing', 'rxjs/webSocket',
  'encrypt-storage', // CommonJS/UMD: NF's export analysis falls back to default-only
  'pubsub-js',
],
features: { denseChunking: true },
```

- Extra shared deps that the host also shares (`@neocore/lib-components`) stay loose
  (`singleton: false, strictVersion: false, requiredVersion: false`) unless the host says otherwise.
- Do not add a third-party CommonJS/UMD package to `shared` without testing named imports; skip it
  and bundle it locally.
- `pubsub-js` is bundled per app but the bus is shared through `window.PubSub` (the "already loaded"
  log is expected).

## `angular.json`

- `build`/`serve` use `@angular-architects/native-federation:build`; `serve-original` uses
  `@angular/build:dev-server`; `esbuild` uses `@angular/build:application`.
- `serve-original.options.port` is the fork's dev port (template 4250; broker 4211; host 4200) and
  `headers: { "Access-Control-Allow-Origin": "*" }` is required for cross-origin loading.
- Polyfills include `es-module-shims` (and `zone.js`). `allowedCommonJsDependencies` includes
  `encrypt-storage`/`pubsub-js` when bundled.
- `build-test` is a plain `@angular/build:application` (no federation, no es-module-shims) used by
  the `unit-test` builder; do not point tests at the federation builder.

## Dev server, build notifications and HMR

- `bun run start` runs `load-env.js` then `ng serve` on the fork port. In dev, `remoteEntry.json`
  advertises `buildNotificationsEndpoint`; the host's `watchLocalRemoteRebuilds()` subscribes to it.
- The host hot-swaps remote component views with `ɵɵreplaceMetadata`; Angular's dev-server HMR only
  handles stylesheets. The fork needs no HMR code — just the dev server + SSE endpoint.
- The host parser understands Angular <=22.1 `static { this.ɵfac... }` and 22.2 `static ɵfac...`
  fields. A fork compiled with either format can be hot-swapped; a future format change needs a host
  parser update.
- Do not run a production `bun run build` while `ng serve` is running (same `dist/browser`; see
  `version-alignment.md`).

## Local verification in the host

1. Add one row per expose to `frontcontainer/src/assets/container.jsonc` (gitignored):
   ```jsonc
   "dev-<name>": {
     "name": "<Title>",
     "remoteEntry": "http://localhost:<fork-port>/remoteEntry.json",
     "path": "<path>",
     "exposedModule": "<Symbol>",
     "isAuthRoute": true,
     "moduleName": "<Group>",
     "typeRemote": "module"
   }
   ```
2. Regenerate `container.json` (`node load-env.js` or restart the host) and hard-reload the browser.
3. For a public/localhost route, the host's `publicGuard` must let localhost remote routes pass
   (host-side change; the HMR branch has it). For auth routes, a valid session is required.
4. Never commit local URLs, `container.json`/`container.jsonc`.

## Build verification

```bash
NODE_ENV=PROD SKIP_ENV_FETCH=1 bun run build
node -e "const j=require('./dist/browser/remoteEntry.json');console.log(j.exposes.map(e=>e.key))"
```

Every exposed key must be present. The production `remoteEntry.json` has no
`buildNotificationsEndpoint` and may use hashed `outFileName`s; that is expected.
