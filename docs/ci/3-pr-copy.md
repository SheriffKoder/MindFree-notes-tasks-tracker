# PR copy — `test/home-page-testing`

Paste-ready title, description, and merge comment for the Home testing + CI
branch.

## Title

```text
feat(testing): Home critical-path tests + CI gates
```

## Description

```markdown
## Summary

Checked the Home page and listed critical areas by priority in
[`docs/testing/home/1-what-matters.md`](../testing/home/1-what-matters.md).

Focused on the most critical first journey for **Notes**:

`authenticated >> notes load >> notes show >> click note >> update >> cached >> reflects on UI`

Placed **stitched** CHEAPEST tests for confidence at each link — practicing
skills such as:

- Integration (tenant isolation + DB persist on twin tables)
- Async sections (mock only) for Home notes loading / error / empty / success
- User flow (open edit, schedule update)
- Cache → UI (Home strip reflects the change)

Then added a full continuous-proof **E2E** that practices:

`authenticated >> notes load >> notes show >> click note >> update >> strip updates >> reload still new`

That E2E covers what the stitch cannot: real login/session, real browser,
real Next server + API, and **hard reload still new** (persist across a full
page load — not only in-memory cache / mocked boundaries).

CI (`docs/ci`) wires the same gates on PR/main via GitHub Actions
(`quality` ∥ `build` → `e2e`) and local `npm run ci`. Lint is deferred
(existing ESLint debt).

## Real DB

We use a real Supabase project for isolation int tests and E2E — not mocks for
the persist boundary.

- Twin Home tables: `mf_testing_*` (migrations `043–045`)
- Dedicated isolation users A/B (seeded)
- App uses `MF_TABLE_PREFIX=mf_testing_` for Home-domain tables only; profile /
  preferences / security stay on live `mf_*`
- Service role is **cleanup/reset only** in E2E — pass/fail is what the user sees

## Steps (how this landed)

1. Prioritize Home areas → `1-what-matters.md`
2. Document how/break for priorities 1, 2, 5
3. CHEAPEST stitched tests (Vitest unit/int + RTL)
4. Playwright continuous-proof for note edit
5. CI docs + workflow + `npm run ci` / `typecheck`

## Plan

- [ ] Actions Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [ ] Actions Secret: `SUPABASE_SERVICE_ROLE_KEY` (test/staging project — not production)
- [ ] Migrations `043–045` applied on that project
- [ ] PR **CI** green: `quality` → `build` → `e2e`
- [ ] Optional local: `npm run ci`
- [ ] Confirm lint is **not** a required check (deferred)

## Notes

- Map + stack practice: `docs/testing/home/1-what-matters.md`
- E2E contract: `docs/testing/home/5-note-edit-write/continuous-proof-e2e.md`
- CI inventory / jobs / env: `docs/ci/1-what-checks.md`, `docs/ci/2-before-yml.md`
- Priorities 3–4 and 6–11 not implemented yet (intentionally)
```

## Merge comment

```text
Home critical-path testing: prioritized areas, stitched CHEAPEST confidence on the Notes journey (isolation → load/show → edit → persist/cache/UI), then Playwright continuous-proof for login → edit → reload. Real twin-table DB for int/E2E. CI gates (typecheck, unit, build, e2e); lint deferred.
```

One-liner:

```text
Ship Home Notes critical-path tests (stitched + E2E) and CI gates; lint deferred.
```
