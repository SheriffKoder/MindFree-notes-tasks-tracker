## ADR 0003: RSC-first pages with TanStack Query hydration

### Status

Accepted

### Context

Notes (and later Home) need:

- Fast first paint with real data for signed-in users
- Interactive editing in a drawer without remounting the whole route
- One source of truth for calendar, lists, and drawer after the page loads

Two naive approaches conflict:

1. **Server Component fetches only** — drawer mutations and month switches either remount the page or invent a second client store.
2. **Client-only TanStack from empty** — weaker first paint; duplicates the server’s ability to read with cookies/RLS on the first request.

Hydrating SSR data into TanStack Query was the design from early Notes architecture notes; Step 5 of the Notes plan shipped it.

### Decision

1. Protected app mounts **one** browser `QueryClient` via `AppQueryProvider` in `app/(app)/layout.tsx`.
2. Route pages stay **sync** when URL search params drive UI (`?month=`, `?view=`). Resolve those params on the client.
3. Server seeds run as **non-blocking hydration** (e.g. `NotesHydrationSeed`): repository → `hydrate*Queries` → `dehydrate` → `QueryHydration`.
4. Client islands (`NotesClient`, Home notes section, drawer) read and write **only** through entity TanStack hooks — no parallel “page props” store for note rows.
5. Domain keys, fetchers, and hydrate helpers live under `entities/<name>/tanstack/`; `shared/react-query` stays generic.

### Why

- SSR and client share one cache shape after hydrate — drawer open does not `GET` a single note when the month/general/home payload already contains it.
- Month/view toggles do not re-run the Server Component tree.
- Optimistic mutations, realtime, and offline flush all patch the same caches.

Alternatives rejected for Notes v1:

- **Redux / Zustand for server notes** — duplicates Query and adds sync tax without buying SSR.
- **Invalidate + refetch whole page on every save** — feels slow and fights drawer UX.
- **Server Actions as the only write path with router.refresh** — fine for forms; poor for debounced autosave + multi-read-model cache.

### Consequences

Positive:

- Instant return visits when keys are warm
- One mental model: “if it’s in Supabase and on screen, it’s in Query (or pending offline)”
- Clear checklist for the next entity (tasks): `tanstack/` + `hydrate*` + provider already exists

Trade-offs:

- Must keep hydrate payloads aligned with client fetchers
- Optimistic + realtime + form local state need careful gates (remote sync key, dirty guard)
- Developers must import `client.ts` vs `server.ts` correctly or they will bundle server code

### Follow-up

- [docs/architecture/caching.md](../architecture/caching.md)
- [shared/react-query/README.md](../../shared/react-query/README.md)
- ADR 0007 (`synchronizeNoteCaches`) when documenting write fan-out
