# CI — What checks we have today

Item 1 of CI work: inventory the commands this repo already has, then decide
**where** each one should land. Item 2 adds the GitHub Actions workflow that
wires the chosen buckets.

Stack note: unit/component tests run on **Vitest + RTL** (not Jest). Playwright
is already configured for Chromium E2E.

## What checks we have today

| Check | Command | Why | Status |
| ----- | ------- | --- | ------ |
| Lint | `npm run lint` | Catch ESLint rule breaks before merge | Exists today · **Deferred** from PR/Main gate (~74 existing problems) |
| Type check | `npm run typecheck` (`tsc --noEmit`) | Block TypeScript errors the linter may miss | Exists today |
| Unit / component | `npm run test:unit` | Fast Vitest + RTL confidence without a browser or live DB | Exists today |
| Integration | `npm run test:int` | Real twin-table (`mf_testing_*`) boundary; needs Supabase secrets | Exists today; wire secrets in Item 2 (or later) |
| E2E | `npm run test:e2e` | Continuous browser proof against a real Next server + twin DB | Exists today; browsers + secrets in Item 2 |
| Build | `npm run build` | Prove `next build` succeeds for production | Exists today |

## Where they can land — four buckets

Classify each command into one or more of these landing places:

| Bucket | Meaning |
| ------ | ------- |
| **Local check** | Developer runs before push — fast feedback, no Actions minutes |
| **Pull request** | Required (or optional) GitHub Actions jobs on every PR |
| **Main** | Re-run on push/merge to the default branch — protect what ships |
| **Scheduled (deferred)** | Nightly/cron for slower or env-heavy suites (E2E / int) — not in Item 2 |

### Classification

For each item: command + one-line why + status.

**Local check**

- `npm run lint` — seconds of feedback before remote CI · Exists today · **Deferred** from `npm run ci` / Actions
- `npm run typecheck` — same as lint — cheap gate on the laptop · Exists today
- `npm run test:unit` — fast; no secrets or browser install · Exists today
- `npm run build` — optional local confidence before a large PR · Exists today
- `npm run test:e2e` — local continuous proof when env + twin DB are ready · Exists today
- `npm run ci` — same gate chain as PR/Main (typecheck → unit → build → e2e) · Exists today

**Pull request**

- `npm run lint` — block style/rule regressions on every change · **Deferred** (existing ESLint debt)
- `npm run typecheck` — block type regressions on every change · Wired in Actions (`quality`)
- `npm run test:unit` — block unit/RTL regressions without waiting on DB · Wired in Actions (`quality`)
- `npm run build` — catch Next compile breaks before merge · Wired in Actions (`build`)
- `npm run test:e2e` — continuous proof on PR (serial / Chromium); needs secrets · Wired in Actions (`e2e`)

**Main**

- `npm run lint` — re-confirm default branch stays clean · **Deferred** (existing ESLint debt)
- `npm run typecheck` — same as PR — protect what is merged · Wired in Actions (`quality`)
- `npm run test:unit` — same as PR · Wired in Actions (`quality`)
- `npm run build` — same as PR — default branch must build · Wired in Actions (`build`)
- `npm run test:e2e` — re-run continuous proof after merge · Wired in Actions (`e2e`)

**Scheduled (deferred)**

- `npm run test:int` — twin-DB suite is slower and secret-heavy; nightly is enough at first · Deferred
- `npm run test:e2e` — optional second lane if PR E2E is too slow or flaky · Deferred

### Intentionally not in the first PR gate

| Command | Why defer |
| ------- | --------- |
| `npm run lint` | ~74 existing problems (mostly `react-hooks/set-state-in-effect` / `exhaustive-deps`); script stays, CI gate waits |
| `npm run test:int` | Needs `SUPABASE_SERVICE_ROLE_KEY` + migrated twin tables; keep local / scheduled until secrets and a test project are stable |
| Full multi-browser E2E | Chromium-only is enough for continuous proof; expand later |

## Next (Item 2)

1. Add `typecheck` script (`tsc --noEmit`) · (done)
2. Add `npm run ci` that runs the same gates as the CI workflow for local checking. · (done)
3. Answer env / jobs / needs / cache before YAML — [2-before-yml.md](./2-before-yml.md) · (done)
4. Add `.github/workflows/ci.yml` for **Pull request** + **Main** buckets (follow [2-before-yml.md](./2-before-yml.md)). · (done)
5. Store CI Variable/Secret values in GitHub (URL + publishable as Variables; service role as Secret). · (done)
6. Install Playwright Chromium in the `e2e` job; cache browsers; upload `test-results` / `playwright-report` as Actions artifacts (fixed folder names when `CI=true`). · (done)
