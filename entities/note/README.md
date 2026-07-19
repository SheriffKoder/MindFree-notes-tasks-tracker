# Note entity (`entities/note`)

Business logic for calendar, general, and quick notes. **One domain** — Notes page and Home are consumers, not forks ([ADR 0010](../../docs/adr/0010-one-domain-multiple-consumers.md)).

The entity is organized by responsibility so database access, server use-cases,
browser requests, React behavior, cache policy, and SSR hydration can change
without becoming one mixed client or repository layer.

## Start here

| Need | Go to |
| ---- | ----- |
| Why kinds / flags / lifecycle | [`docs/domain-model.md`](./docs/domain-model.md) |
| APIs, read payloads, keys, and hydration | [`docs/read-models.md`](./docs/read-models.md) |
| Autosave / create / delete | [`docs/writes-and-autosave.md`](./docs/writes-and-autosave.md) |
| Quick slot | [`docs/quick-note.md`](./docs/quick-note.md) |
| Realtime / offline / form snap | [`docs/realtime.md`](./docs/realtime.md), [`offline.md`](./docs/offline.md), [`optimistic-updates.md`](./docs/optimistic-updates.md) |
| File lookup by responsibility | [`RESPONSIBILITIES.md`](./RESPONSIBILITIES.md) |
| Glossary | [`docs/concepts/glossary.md`](../../docs/concepts/glossary.md) |

All WHY docs: [`docs/README.md`](./docs/README.md)

## Stable entry points

| File | Use in | Exports |
| ---- | ------ | ------- |
| `index.ts` | Any layer | Domain types, read-model types, pure month helpers |
| `server.ts` | Server Components, API routes | Reads, SSR cache seeders, write use-cases, server errors/auth helper |
| `client.ts` | `"use client"` modules | TanStack keys/options/fetchers, read and mutation hooks, realtime hook |
| `editor/index.ts` | Client form UI | Form schema, `useNoteForm`, `NoteForm` |

These public surfaces stay stable while their implementations are split into
focused responsibility groups:

```text
model/ + lib/ + schema/ + errors/ + transform/
                         ↑
repository/ → queries/ + mutations/ → server.ts → RSC and API routes
client/ + cache/ + hooks/ + offline/ → client.ts → views and drawer
client/query options → hydration/ → server.ts → SSR cache seed components
editor/ → reusable form fields and local form state
```

- `repository/` is data access only; `queries/` and `mutations/` own server
  use-case decisions.
- `client/` defines browser transport and TanStack query configuration;
  `hooks/` owns React lifecycle and mutation orchestration.
- `cache/` centralizes read-model consistency so HTTP mutations, realtime, and
  offline reconciliation apply the same membership rules.
- API routes stay thin: auth → one `server.ts` export → JSON.
- Auth / RLS pattern: [`shared/lib/auth/README.md`](../../shared/lib/auth/README.md).

## Folder map

```text
entities/note/
├── model/           # Domain/DB-row types and response read models
├── lib/             # Pure month parsing and range helpers
├── schema/          # Zod write request/response contracts
├── errors/          # Note-specific domain errors
├── repository/      # Split Supabase operations; index.ts is the surface
├── transform/       # DB-row mapping and month aggregation
├── queries/         # Server read use-cases
├── mutations/       # Server write use-cases
├── client/          # Keys, fetchers, query options, prefetch, HTTP writes
├── hooks/           # Read/mutation/realtime hooks and pending tracker
├── cache/           # Pure cache helpers, realtime apply, synchronization hub
├── hydration/       # SSR QueryClient seeders
├── offline/         # Offline queue and flush adapters into the cache hub
├── editor/          # Reusable form (no save routing)
└── docs/            # WHY (domain, read models, writes, sync)
```

## Editor vs drawer

```text
views/*/model/editor         open/close, NoteEditorRequest
features/notes/note-drawer   shell, resolve note, date nav, orchestrator
entities/note/editor         fields, validation, local dirty state
```

Orchestrator WHY: [`features/notes/note-drawer/pre-save-orchestrator/README.md`](../../features/notes/note-drawer/pre-save-orchestrator/README.md)

## Consumers

| Consumer | Imports |
| -------- | ------- |
| `app/(app)/notes`, `app/(app)/page` hydration | `server.ts` |
| `app/api/notes/*` | `server.ts` |
| `views/notes`, `views/home` (client) | `client.ts` |
| `features/notes/note-drawer` | `client.ts`, `editor/` |
| Shared types and pure month helpers | `index.ts` |

Home strip WHY: [`views/home/docs/notes-strip.md`](../../views/home/docs/notes-strip.md)
