# CI — Before the YAML (Item 2 plan)

Answers we need before adding `.github/workflows/ci.yml`. This is the
contract the workflow must follow; Item 2 point 3 is documenting it (this
file), then point 4 adds the YAML.

## 1. GitHub env — Secret vs Variable

| Name | Kind | Needed by | Why this kind |
| ---- | ---- | --------- | ------------- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Variable** | `build`, `e2e` (Next server) | Public URL; safe to show in logs. Still required at build/runtime so Next can talk to Supabase. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Variable** | `build`, `e2e` (Next server) | Anon/publishable key is client-exposed by design (`NEXT_PUBLIC_`). |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | `e2e` cleanup (and later `test:int`) | Bypasses RLS. Must never appear in logs or client bundles. |
| `MF_TABLE_PREFIX` | *(not in GitHub)* | Playwright already sets `mf_testing_` on `webServer` | Hardcoded in `playwright.config.ts` for E2E; do not duplicate as a repo secret unless we later want to override. |
| `CI` | *(Actions sets)* | Playwright retries/artifacts | GitHub sets `CI=true` automatically. |
| `ENABLE_DEMO_LOGIN` / `DEMO_*` | — | Not for first CI | E2E logs in as isolation users from fixtures, not demo login. |
| Isolation user password | — | Already in repo fixtures / migration 044 | Not a GitHub secret for v1 (already committed). Revisit if we rotate off the fixed seed password. |
| `WEATHER_API_KEY` | — | Not for first CI | World Time only; lint/unit/build/e2e Home journey do not need it. |

**Repo settings (Item 2 point 5):** add the three rows above under GitHub → Settings → Secrets and variables → Actions. Use a **dedicated test/staging Supabase project** with migrations `043–045` applied — never production.

## 2. What runners / checks group into jobs — and why

One machine can run everything (`npm run ci`), but splitting jobs gives faster
fail and isolates expensive/secret-heavy work.

| Job id | Runs | Why group this way |
| ------ | ---- | ------------------ |
| `quality` | `typecheck` → `test:unit` (`lint` **deferred**) | No secrets, no browser, no Next server. Cheapest fail-fast gate. |
| `build` | `npm run build` | Needs `NEXT_PUBLIC_*` vars; heavier than lint; separate so quality can fail without waiting on a full Next compile. |
| `e2e` | Playwright Chromium (`test:e2e`) | Needs secrets + browser install + long runtime. Keep alone so flakes and artifact uploads do not muddy quality/build logs. |

`test:int` stays out (Scheduled deferred).

## 3. Dependent jobs

```text
quality ──┐
          ├──► e2e
build   ──┘
```

| Job | `needs` | Why |
| --- | ------- | --- |
| `quality` | — | First signal; nothing depends on it finishing first except e2e. |
| `build` | — | Runs **in parallel** with `quality` (same checkout/install pattern). |
| `e2e` | `quality`, `build` | Do not spend Chromium + Supabase minutes if lint/types/unit or production compile already failed. |

No job depends on `e2e` for merge confidence beyond the status check itself (artifact upload is best-effort `if: always()`).

## 4. `cache: npm` — yes, and why

| Cache | Use? | Why |
| ----- | ---- | --- |
| `actions/setup-node` → `cache: npm` | **Yes** on every job that runs `npm ci` | Keys off `package-lock.json`; skips re-downloading the dependency graph on cache hit. Biggest win when `quality` / `build` / `e2e` each install. |
| Playwright browser cache (`~/.cache/ms-playwright`) | **Yes** on `e2e` only (separate `actions/cache`) | Chromium download is large and slow; npm cache does **not** cover browser binaries. Key by Playwright package version. |
| Next.js `.next/cache` | Optional later | Nice for repeated `build`s; not required for v1. |

Do **not** cache `node_modules` by hand when using `cache: npm` + `npm ci` — setup-node’s npm cache is the supported path.

## Decision summary (feeds the YAML)

1. Vars: URL + publishable key. Secret: service role only (for now).
2. Three jobs: `quality` ∥ `build` → `e2e`.
3. `e2e` needs both `quality` and `build`.
4. npm cache on all install jobs; Playwright browser cache on `e2e`.
