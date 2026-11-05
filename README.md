# Jerath Moreira — Portfolio

One-page portfolio built on [front-template](https://gitads.aseguradoradelsur.com/neocore/core/front-template)
(Angular 22) and served by a Cloudflare Worker with a small CMS (`/admin`, D1 + R2).

- `src/app/modules/portfolio/` — the page (Angular). `legacy/portfolio-motion.ts` is the original
  vanilla script (scroll scenes, menu, dialogs, brief form), ported as-is.
- `worker/` — the Worker: `/api/*`, `/admin`, `/uploads/*` and the app shell with the content
  injected as `window.jmPortfolioData`.
- `public/static/` — the admin panel and the media extracted from the old single-file page.

```bash
bun install
bun run worker:dev     # builds the site and runs the Worker on http://localhost:8787
bun run build:site     # site build the Worker serves (dist-site/, no federation)
bun run test:worker    # Worker smoke test (needs a previous `bun run build:site`)
bun run deploy         # wrangler deploy (builds first)
```

The Worker serves `build:site`: the same app without Native Federation (no
`es-module-shims`, no host plumbing in `app.config.site.ts`), much lighter. `bun run build` stays
the template's federation build. Hashed files (`*-HASH.js/css`, `/static/media/<hash>.*`) are
cached for a year: when a media file changes, give it a new content-hash name.

`/admin` needs `ADMIN_PASSWORD` and `SESSION_SECRET` in `.dev.vars` locally, and as Wrangler
secrets in production. The Windows scripts (`DEPLOY_CLOUDFLARE.bat`, `ACTUALIZAR_*.bat`) keep working.

---

# front-template

Base of every Neocore micro-frontend: an Angular 22 remote (standalone, signals) loaded by the host
`frontcontainer` through Native Federation. Fork it to start a new MF.

## Quickstart

Requirements: [bun](https://bun.sh) 1.4+, Node 22.22+.

```bash
bun install            # dependencies + .env from .env.example
bun run start          # http://localhost:4250 (standalone, redirects to /template)
bun run test           # unit tests (vitest) + script tests
bun run lint           # oxlint
bun run build          # dist/browser/remoteEntry.json exposing ./TemplateRoutes
```

Set `SECRET_KEY` in `.env` to the host's value to read the session token stored by the host.

## Start a new MF from this template

1. Fork/clone, then set `name` in `package.json` and `federation.config.mjs`, the project name and
   dev port in `angular.json`, and the `variables:` block of `.gitlab-ci.yml`.
2. Create features with `bun run generate:module -- --name=<kebab-name> --expose`.
3. Register each exposed entry as a manifest row in ms-core (see `.agents/host-integration.md`).
4. Keep in sync with this repo through `git merge` (see `.agents/merge-changes-from-front-template.md`).

## Docs

- [`AGENTS.md`](AGENTS.md) — rules and capability map (start here, also for AI agents)
- [`.agents/`](.agents/) — architecture, host integration, environment, testing, deployment
- [`src/app/modules/template/README.md`](src/app/modules/template/README.md) — reference module
