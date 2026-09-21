# Tests

| Path | Kind |
| ---- | ---- |
| `tests/home/tenant-isolation/` | Home tenant-isolation tests (mirrors docs risk area) |
| `tests/home/tenant-isolation/notes/int/` | Notes View/Edit isolation integration contracts |
| `tests/home/starred-notes-read/` | Home starred-notes (read) — Priority 2 |
| `tests/home/starred-notes-read/async-section/unit/` | Async section unit (mock query) contracts |
| `tests/home/fixtures/` | Fixed isolation user / row ids (migrations 044–045) |
| `tests/setup/` | Env load, `MF_TABLE_PREFIX`, service-role client, RTL |

```bash
npm run test:unit   # colocated *.test.ts + tests/**/unit/** (node + happy-dom)
npm run test:int    # tests/**/int/**
npm test            # all projects
```

Int tests need `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in
`.env` / `.env.local`, plus migrations `043`–`045` applied.
