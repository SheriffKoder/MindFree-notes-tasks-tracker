# Data flow

How a request becomes domain data — and how writes leave the UI without bloating route handlers.

**Structure rules:** [`.cursor/rules/project-structure.mdc`](../../.cursor/rules/project-structure.mdc)
**Auth / RLS:** [guides/security.md](../guides/security.md)

---

## Read path (Notes)

```text
Browser / RSC
  → GET /api/notes/calendar?month=…   (or server query use-case directly on SSR)
  → requireAuthenticatedUserId()
  → entities/note/queries/get-*-response
  → repository (user_id + RLS)
  → transform (e.g. month → calendarDays)
  → JSON / hydrate TanStack
  → views use*Query → UI
```

API routes stay **thin**: auth → one `server.ts` export → `Response.json`. Business filters and aggregation live in the entity, not in `app/api`.

---

## Write path (Notes)

```text
NoteForm onChange
  → evaluateNoteSave (pure)
  → debounce
  → online? TanStack mutation → fetch PATCH/POST/DELETE → use-case → repository
         → synchronizeNoteCaches
  → offline? pending localStorage → optimistic hub → flush later
```

Route handlers do not interpret “picker title means calendar.” That stays in the pre-save orchestrator ([ADR 0006](../adr/0006-pre-save-orchestrator.md)).

---

## Layer meaning

| Layer | Owns | Example |
| ----- | ---- | ------- |
| `app/` | Routing, thin handlers, layouts | `app/api/notes/calendar/route.ts` |
| `views/` | Page composition, URL state | `views/notes/ui/notes-client.tsx` |
| `features/` | Product workflows (drawer island) | `features/notes/note-drawer` |
| `entities/` | Domain reads/writes/cache | `entities/note` |
| `shared/` | Cross-domain infra | `shared/react-query`, `shared/offline-queue` |

**Dependency direction:** views/features import entity public barrels; entities do not import views.

---

## Aggregation on the server

Calendar consumers need `CalendarDay[]`, not raw SQL rows. Month length, leap years, and day slots are assembled in `transform/` / query use-cases so the client mostly renders ([read-models](../../entities/note/docs/read-models.md)).

---

## Adding another entity (e.g. tasks)

1. Create `entities/<name>/` with only the responsibility groups it needs:
   `queries/` for server reads, `repository/` for persistence, `client/` for
   fetchers/keys/options/prefetch, `hooks/` for React hooks, `cache/` for cache
   transforms and synchronization, and `hydration/` for SSR cache seeders.
2. Thin `app/api/<name>/…` using `requireAuthenticatedUserId` + repository `user_id`
3. View island consumes `client.ts` hooks
4. Reuse `shared/react-query` and (if needed) `shared/offline-queue` adapters

These names describe current responsibilities, not a locked folder vocabulary.
Add another focused group when a distinct responsibility emerges; do not collect
unrelated entity code in a generic TanStack dumping folder.

Checklist also lives in [shared/react-query/README.md](../../shared/react-query/README.md).

---

## Related

| Doc | Why |
| --- | --- |
| [caching.md](./caching.md) | Where responses land after fetch |
| [rendering.md](./rendering.md) | RSC vs island boundary |
| [entities/note/README.md](../../entities/note/README.md) | Entry points |
