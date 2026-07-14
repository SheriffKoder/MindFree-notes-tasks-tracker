# Note entity (`entities/note`)

Business logic for calendar, general, and quick notes. **One domain** — Notes page and Home are consumers, not forks ([ADR 0010](../../docs/adr/0010-one-domain-multiple-consumers.md)).

## Start here

| Need | Go to |
| ---- | ----- |
| Why kinds / flags / lifecycle | [`docs/domain-model.md`](./docs/domain-model.md) |
| APIs & TanStack keys | [`docs/read-models.md`](./docs/read-models.md) |
| Autosave / create / delete | [`docs/writes-and-autosave.md`](./docs/writes-and-autosave.md) |
| Quick slot | [`docs/quick-note.md`](./docs/quick-note.md) |
| Realtime / offline / form snap | [`docs/realtime.md`](./docs/realtime.md), [`offline.md`](./docs/offline.md), [`optimistic-updates.md`](./docs/optimistic-updates.md) |
| File lookup by responsibility | [`RESPONSIBILITIES.md`](./RESPONSIBILITIES.md) |
| Glossary | [`docs/concepts/glossary.md`](../../docs/concepts/glossary.md) |

All WHY docs: [`docs/README.md`](./docs/README.md)

## Entry points

| File | Use in | Exports |
| ---- | ------ | ------- |
| `index.ts` | Any layer | Domain types, pure month helpers |
| `server.ts` | Server Components, API routes | Reads, SSR hydrate, write use-cases |
| `client.ts` | `"use client"` modules | TanStack keys, fetchers, hooks, mutations |
| `editor/` | Client form UI | Schema, `useNoteForm`, `NoteForm` |

```text
model / lib / transform / repository
        ↑
 queries/ + mutations/  →  server.ts  →  pages & API
 tanstack/ + offline/   →  client.ts  →  views & drawer
 editor/                →  dumb form fields only
```

- Lower layers never import `queries/` or `tanstack/`.
- API routes stay thin: auth → one `server.ts` export → JSON.
- Auth / RLS pattern: [`shared/lib/auth/README.md`](../../shared/lib/auth/README.md).

## Folder map

```text
entities/note/
├── docs/            # WHY (domain, read models, writes, sync)
├── model/           # Types
├── lib/             # Pure helpers
├── repository/      # Supabase CRUD
├── transform/       # Month aggregation
├── queries/         # Server read use-cases
├── mutations/       # Server writes + cache helpers + sync hub
├── tanstack/        # Client cache, hydrate, realtime, mutations
├── offline/         # Offline adapter → hub
└── editor/          # Reusable form (no save routing)
```

## Editor vs drawer

```text
views/*/model/editor     open/close, NoteEditorRequest
features/notes/note-drawer   shell, resolve note, date nav, orchestrator
entities/note/editor         fields, validation, local dirty state
```

Orchestrator WHY: [`features/notes/note-drawer/docs/pre-save-orchestrator.md`](../../features/notes/note-drawer/docs/pre-save-orchestrator.md)

## Consumers

| Consumer | Imports |
| -------- | ------- |
| `app/(app)/notes`, `app/(app)/page` hydrate | `server.ts` |
| `app/api/notes/*` | `server.ts` |
| `views/notes`, `views/home` (client) | `client.ts` |
| `features/notes/note-drawer` | `client.ts`, `editor/` |
| Shared types | `index.ts` |

Home strip WHY: [`views/home/docs/notes-strip.md`](../../views/home/docs/notes-strip.md)
