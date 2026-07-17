# Activity entity (`entities/activity`)

Business logic for tasks and reminders. **One domain, two kinds** — the Tasks
page, Home Today, and Progress are consumers, not forks
([domain-model.md](./docs/domain-model.md)).

## Start here

| Need | Go to |
| ---- | ----- |
| Why one model / kinds / lifecycle | [`docs/domain-model.md`](./docs/domain-model.md) |
| Recurrence + validity window + status | [`docs/scheduling.md`](./docs/scheduling.md) |
| Caches, calendar join, month progress | [`docs/read-models.md`](./docs/read-models.md) |
| Create / patch / archive / delete + autosave | [`docs/writes-and-autosave.md`](./docs/writes-and-autosave.md) |
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
 client/ + hooks/ + cache/ →  client.ts  →  views & drawer
 editor/                  →  dumb form fields only
```

- Lower layers never import `queries/`, `hooks/`, or `client.ts`.
- API routes stay thin: auth → one `server.ts` export → JSON.
- Cross-slice consumers import from `index.ts` / `server.ts` / `client.ts` /
  `editor/` — never from segment paths.

## Folder map

```text
entities/activity/
├── docs/         # WHY (domain, scheduling, read models, writes)
├── model/        # Types + read-model payloads
├── schema/       # Zod contracts (form, create, update)
├── lib/          # Pure helpers (month, schedule, record, mapping)
├── transform/    # Calendar join, month progress, record shaping
├── repository/   # Supabase CRUD (RLS-scoped)
├── queries/      # Server read use-cases
├── mutations/    # Server write use-cases
├── cache/        # Pure cache updaters + sync hub
├── client/       # TanStack keys, fetchers, hydrate
├── hooks/        # Read queries + write mutations
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
| `features/activity/*` | `client.ts`, `editor/`, `index.ts` |
| Shared types | `index.ts` |
