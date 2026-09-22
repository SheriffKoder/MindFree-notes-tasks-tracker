# Tests

| Path | Kind |
| ---- | ---- |
| `tests/home/tenant-isolation/` | Home tenant-isolation tests (mirrors docs risk area) |
| `tests/home/tenant-isolation/notes/int/` | Notes View/Edit isolation integration contracts |
| `tests/home/starred-notes-read/` | Home starred-notes (read) — Priority 2 |
| `tests/home/starred-notes-read/async-section/unit/` | Async section unit (mock query) contracts |
| `tests/home/note-edit-write/` | Home note edit (write) — Priority 5 |
| `tests/home/note-edit-write/user-flow/unit/` | User-flow open-edit + evaluate→patch contracts |
| `tests/home/note-edit-write/persist-and-refresh/int/` | Persist row-changed-in-DB contracts |
| `tests/home/note-edit-write/persist-and-refresh/unit/` | Persist Home-cache + cache→UI contracts |
| `tests/home/note-edit-write/continuous-proof/e2e/` | Continuous-proof happy path — [docs](../docs/testing/home/5-note-edit-write/continuous-proof-e2e.md) |
| `tests/e2e/` | Playwright setup smoke contracts |
| `tests/home/fixtures/` | Fixed isolation user / row ids (migrations 044–045) |
| `tests/setup/` | Env load, `MF_TABLE_PREFIX`, service-role client, RTL |

```bash
npm run test:unit   # colocated *.test.ts + tests/**/unit/** (node + happy-dom)
npm run test:int    # tests/**/int/**
npm run test:e2e    # Chromium; Playwright starts Next.js with mf_testing_*
npm test            # all projects
```

Int tests need `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in
`.env` / `.env.local`, plus migrations `043`–`045` applied.

Install the Chromium binary once with `npx playwright install chromium`.
Use `npm run test:e2e:headed` or `npm run test:e2e:ui` while debugging.
