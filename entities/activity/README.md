# Activity entity (`entities/activity`)

Business logic for tasks and reminders. **One domain, two kinds** — the Tasks
page, Home Today, and Progress are consumers, not forks
([domain-model.md](./docs/domain-model.md)).

## Start here

| Need | Go to |
| ---- | ----- |
| Why one model / kinds / lifecycle | [`docs/domain-model.md`](./docs/domain-model.md) |
| Recurrence + validity window + status | [`docs/scheduling.md`](./docs/scheduling.md) |
| Caches, calendar/Home joins, progress | [`docs/read-models.md`](./docs/read-models.md) |
| Definition autosave + daily record writes | [`docs/writes-and-autosave.md`](./docs/writes-and-autosave.md) |
| Multi-tab / multi-device live sync | [`docs/realtime.md`](./docs/realtime.md) |
| Offline queue + flush on reconnect | [`docs/offline.md`](./docs/offline.md) |
| File lookup by responsibility | [`docs/responsibilities.md`](./docs/responsibilities.md) |
| Layer / folder names | [`docs/concepts/terminology.md`](../../docs/concepts/terminology.md) |

All WHY docs: [`docs/README.md`](./docs/README.md)

## Entry points

| File | Use in | Exports |
| ---- | ------ | ------- |
| `index.ts` | Any layer | Domain types, pure schedule/record/month helpers |
| `server.ts` | Server Components, API routes | Reads, SSR hydrate, write use-cases, auth |
| `client.ts` | `"use client"` modules | TanStack keys, fetchers, read + mutation hooks |
| `editor/` | Client form UI | Form types, `useActivityForm`, `ActivityForm`, `ScheduleInput` |

```text
model / schema / lib / transform / repository
        ↑
 queries/ + mutations/   →  server.ts  →  pages & API
 client/ + hooks/ + cache/ + offline/ →  client.ts / offline/  →  views & drawer
 editor/                  →  dumb form fields only
```

- Lower layers never import `queries/`, `hooks/`, or `client.ts`.
- API routes stay thin: auth → one `server.ts` export → JSON.
- Cross-slice consumers import from `index.ts` / `server.ts` / `client.ts` /
  `editor/` / `offline/` — never from segment implementation paths.

## Folder map

```text
entities/activity/
├── docs/         # WHY (domain, scheduling, read models, writes, realtime, offline)
├── model/        # Types + read-model payloads
├── schema/       # Zod contracts (form, definitions, record writes)
├── lib/          # Pure helpers (month, schedule, record, today, mapping)
├── transform/    # Calendar join, month progress, record shaping
├── repository/   # Supabase definition + record CRUD (RLS-scoped)
├── queries/      # Server read use-cases
├── mutations/    # Server definition + record write use-cases
├── cache/        # Pure definition/record cache updaters + sync hub
├── client/       # TanStack keys, fetchers, SSR seed
├── hooks/        # Read selectors/queries + write mutations
├── offline/      # Offline queue adapter → sync hub
└── editor/       # Reusable config form (no save routing)
```

## Editor vs drawer

```text
views/tasks/model/use-tasks-drawer      open/close, create-vs-edit intent
features/activity/activity-drawer        shell, resolve activity, config orchestrator
entities/activity/editor                 fields, validation, local dirty state
```

Autosave decision + orchestrator:
[`docs/writes-and-autosave.md`](./docs/writes-and-autosave.md).

## Consumers

| Consumer | Imports |
| -------- | ------- |
| `app/(app)/tasks` hydrate | `server.ts` |
| `app/api/activities/*` | `server.ts` |
| `views/tasks` (client) | `client.ts` |
| `views/home` (client) | `client.ts` |
| `features/activity/*` | `client.ts`, `editor/`, `index.ts` |
| Shared types | `index.ts` |
