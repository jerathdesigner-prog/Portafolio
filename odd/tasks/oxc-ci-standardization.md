# front-template: oxc tooling, pre-commit and standardized CI

Objective: replace Biome with Oxc (oxlint + oxfmt), run them on pre-commit, and standardize the GitLab CI like backtemplate (tests in the pipeline, Node/Bun versions read from `.node-version`/`.bun-version`).
Branch: `rama`. Delivery: `ask-on-risk`. Test runner: Angular unit builder (vitest) + `node --test` for scripts.

## Specs

- S1 — "necesito que te revises la documentacion del https://oxc.rs/ e implementes exto en el fronttemplate tanto el fromateador como el linter" — oxlint is the linter and oxfmt the formatter (Biome removed), configured per the official docs.
- S2 — "y agregues para que sea haga con pre commit" — a husky pre-commit runs oxfmt + oxlint on staged files (lint-staged).
- S3 — "al igual que en el @core/backtemplate se tenga estandarizado el ci cd para que se ejecuten test en el pipeline como en el backtemplate" — CI structure follows backtemplate: `resolve_versions`, cache warmer `install_deps`, test jobs on the Node image.
- S4 — "asi mismo com en el backtempalte que saque las versiones de node y bun por los archivos .bun-version y .node-version" — `.node-version` and `.bun-version` are the single source of truth for CI images and the Dockerfile.

## Tasks

- T1 [S1] oxlint + oxfmt, configs, scripts, repo formatted, Biome removed — route: inline — status: done (oxlint 1.89 / oxfmt 0.74, TS configs `.mts`)
- T2 [S2] husky + lint-staged pre-commit — route: inline — status: done (probe: format restaged, lint violation blocks)
- T3 [S4] version files + Dockerfile ARG + guard test — route: inline — status: done (scripts/tool-versions.test.js, 4 tests)
- T4 [S3,S4] CI like backtemplate — route: inline — status: done (resolve_versions, lint, format:check, test:unit on node image)

## Log

- L1 (2026-10-26) "necesito que te revises la documentacion del https://oxc.rs/ e implementes exto en el fronttemplate tanto el fromateador como el linter y agregues para que sea haga con pre commit, ademas que necesito que al igual que en el @core/backtemplate se tenga estandarizado el ci cd para que se ejecuten test en el pipeline como en el backtemplate, asi mismo com en el backtempalte que saque las versiones de node y bun por los archivos @core/backtemplate/.bun-version y @core/backtemplate/.node-version"
- L2 (2026-10-26) "por si acaso usa las versiones ts de oxc, porque asi es mas facil poner plugins y demas, o js, la que sea mas recomendable" → `oxlint.config.ts` / `oxfmt.config.ts` (`.mts`: ESM without `"type": "module"`, which would break the CommonJS scripts; plain `.ts` makes Node reparse and warn).
- L3 (2026-10-26) Decisions: Markdown excluded from oxfmt (table padding noise in hand-written docs); `typescript/no-extraneous-class` off (Angular decorated classes); lint runs with `--deny-warnings` locally, in pre-commit and CI. Markdown files reformatted before the exclusion were left modified (reverting was blocked); the user decides whether to revert them.
- L4 (2026-10-26) Verification: lint, format:check, test (27 unit + 12 node:test), build green on Node 26.12.1 / Bun 1.4.4. Not verified: the real GitLab pipeline and a Docker build with the new ARG.
