---
name: deploy-cloudflare
description: "Trigger: deploy, desplegar, publicar, subir a Cloudflare, wrangler deploy, jerathmoreira.com. Build and deploy the portfolio Worker to Cloudflare, then verify."
license: Apache-2.0
metadata:
  author: "macluiggy"
  version: "1.0"
---

## Activation Contract

Load when the user asks to deploy or publish this portfolio (Angular app + Cloudflare
Worker `jerathmoreira-cms`, D1 `jerathmoreira-db`, R2 `jerathmoreira-media`).

## Hard Rules

- Deploying publishes the live site: run it only when the user asked for it in this turn.
- Never run `wrangler login`, enter credentials or tokens, or pick an account: the user does it.
- Never create, delete or reset D1/R2, and never run `wrangler secret put` unless asked:
  production content and admin secrets already exist and survive deploys.
- Never use `--temporary`, `--dry-run` as a substitute, or edit `wrangler.jsonc` to make it pass.
- Never commit or push as part of a deploy; report uncommitted changes instead.

## Decision Gates

| State | Action |
|-------|--------|
| `wrangler whoami` says not authenticated | Stop; give `npx wrangler login` and wait |
| Uncommitted or mid-merge changes | Tell the user what will be published (disk, not git); continue only if they confirm |
| Tests or build fail | Stop and report; do not deploy |
| Deploy fails on compatibility date / auth / binding | Report the exact error; do not change config on your own |

## Execution Steps

1. `cd` to the repo root (where `wrangler.jsonc` lives).
2. `npx wrangler whoami` — must be the account that owns `jerathmoreira.com`.
3. `git status -sb` — report branch, merge state and uncommitted files.
4. `bun run build:site && bun run test && bun run test:worker` (`test:worker` reads `dist-site`).
5. `bun run deploy` (`wrangler deploy` reruns `build:site` via `build.command`).
6. Verify: `curl -s -o /dev/null -w "%{http_code}"` on `https://jerathmoreira.com/`,
   `/api/health` and `/admin` (expect 200), and that `/` contains `jmPortfolioData=`.

## Output Contract

Report: account, git state published, check results, the deployed version id/URL from
wrangler, the three verification status codes, and any failure verbatim.

## References

- `README.md` — commands and project layout.
- `wrangler.jsonc` — Worker, assets and bindings.
- `PUBLICAR_CLOUDFLARE.ps1` — first-time setup on Windows (creates D1/R2, sets secrets).
