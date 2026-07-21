# Caching

How MindFree keeps server data in the browser: TanStack Query as the shared client source of truth after SSR hydrate.

Infra detail: [shared/react-query/README.md](../../shared/react-query/README.md)  
Notes payloads: [entities/note/docs/read-models.md](../../entities/note/docs/read-models.md)

---

## Why TanStack Query (not refetching the page)

Editing happens in a drawer; lists and calendar must update immediately without remounting the route. That needs:

1. **One cache** shared by page islands and the drawer.
2. **Optimistic updates** on mutate (then reconcile with the server).
3. **No whole-page remount** when `?month=` / `?view=` change.

SSR alone cannot do (2). Client `fetch` alone without a cache would leave calendar, list, Home, and drawer as competing sources of truth. Hydrated TanStack Query is the compromise: server seeds, client owns interactive state.

---

## Layer split

```text
shared/react-query     QueryClient, AppQueryProvider, HydrationBoundary
entities/<name>/tanstack   Keys, fetchers, hooks, hydrate*, mutations
entities/<name>/server.ts  SSR reads + hydrate helpers
views/<page>/              Wires hooks to UI — does not invent keys
```

**Rule:** domain keys and cache patching live in the entity. Shared code stays generic.

---

## Notes keys (example of the pattern)

| Key | Independence |
| --- | ------------ |
| `["calendarNotes", month]` | Month-scoped — navigating July must not refetch general |
| `["generalNotes"]` | Month-independent |
| `["homeNotes"]` | Home-only shape (quick + starred) |

Separate keys are intentional. One mega-`["notes"]` blob would couple month navigation to every consumer.

---

## SSR hydrate → client read

```text
Server page / seed
  → get*Response (repository)
  → hydrate*Queries → dehydrate
  → <QueryHydration>

Browser QueryClient
  → use*Query reads hydrated data (or fetches on miss)
  → mutations / realtime / offline update setQueryData
```

`AppQueryProvider` lives once in `app/(app)/layout.tsx` so Notes and Home share the same client across navigations.

For Notes, the route shell stays sync: URL params resolve on the client; hydration can run as a parallel non-blocking seed so toggles do not wait on the server page.

---

## Writes update caches in place

After create / patch / delete:

1. Prefer **optimistic `setQueryData`** on owning keys (and home membership).
2. Avoid invalidating the whole world unless the server changed unexpected rows.
3. Route every normalized change through **`synchronizeNoteCaches`** so calendar, general, and home stay consistent.

Realtime (`postgres_changes`) and offline flush adapt their payloads into the same `NoteChange` shape, then call the hub — sources differ; cache rules do not. Activity mirrors this for definitions + records; see [entities/activity/docs/realtime.md](../../entities/activity/docs/realtime.md) (Progress stays pure SSR — no TanStack key).

---

## Prefetch

Adjacent calendar months are prefetched from the Notes views section and the drawer date navigator so month edges feel warm. Prefetch still uses the same `["calendarNotes", month]` keys — no parallel store.

---

## What not to cache here

| Concern | Where it lives instead |
| ------- | ---------------------- |
| Form draft while typing | `useNoteForm` (ephemeral) |
| Offline pending writes | `shared/offline-queue` + entity adapter |
| Auth session | Supabase cookies / server auth helpers |
| Progress monthly report | Pure SSR — no TanStack keys; see [rendering.md](./rendering.md) and [views/progress/docs/data-flow.md](../../views/progress/docs/data-flow.md) |

---

## Related

| Doc | Why |
| --- | --- |
| [state-management.md](./state-management.md) | Which state belongs in Query vs URL vs UI |
| [read-models.md](../../entities/note/docs/read-models.md) | Payload ↔ key mapping |
| [entities/note/docs/realtime.md](../../entities/note/docs/realtime.md) | Notes live sync |
| [entities/activity/docs/realtime.md](../../entities/activity/docs/realtime.md) | Activity live sync (Progress excluded) |
| [views/progress/docs/data-flow.md](../../views/progress/docs/data-flow.md) | Progress pure-SSR exception (no hydrate) |
| ADRs | [0003](../adr/0003-rsc-first-with-query-hydration.md), [0007](../adr/0007-synchronize-note-caches-hub.md), [0009](../adr/0009-offline-writes-simple-queue.md) |
| Workflow | `02-notes-page.md` Step 5; `home/notes-strip.md` sync hub |
