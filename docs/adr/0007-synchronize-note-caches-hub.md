## ADR 0007: Synchronize note caches hub

### Status

Accepted

### Context

Notes exposes three client read models (`calendarNotes`, `generalNotes`, `homeNotes`). Every write path had to update membership correctly:

- Star on/off → home starred list
- Date move → leave one month / enter another (or general)
- Quick promote/graduate → home quick slot
- Delete → remove from every model that held the row

Doing that inline in PATCH `onMutate`, DELETE, realtime UPDATE, and offline flush duplicated rules and drifted (Home strip missed updates while Notes looked fine).

Premature abstraction was also a risk — a hub with no call sites teaches the wrong lesson.

### Decision

1. Normalize every write into a discriminated union:

   ```ts
   type NoteChange =
     | { type: "create"; note: Note }
     | { type: "update"; previous: Note; next: Note }
     | { type: "delete"; note: Note };
   ```

2. Apply changes through **`synchronizeNoteCaches(queryClient, change)`** — source-agnostic owner + home updates.
3. Keep **adapters at the boundary**: TanStack mutations, `applyRealtimeNoteChange`, offline flush map their events → `NoteChange`, then call the hub.
4. The hub does **not** know HTTP verbs, Supabase payload shapes, or `localStorage` keys.
5. Extract only after several real call sites repeated the same owner + home rules (Notes strip Phase B).

### Why

- One answer to “a note changed — update every read model that cares”
- Home stays a consumer, not a fork of save logic
- Unit tests can assert cache shapes without mocking PATCH/realtime

Rejected:

- **Invalidate all note queries on every write** — flicker and redundant network
- **Home-only mutation hooks** — split brain with Notes
- **Hub that infers `previous` from cache always** — hides missing adapter data; callers that only have `next` must choose create/upsert semantics explicitly

### Consequences

Positive:

- Realtime and offline reuse the same membership rules as optimistic UI
- Adding a fourth read model has one fan-out point

Trade-offs:

- Adapters must supply correct `previous` / `next` (especially date moves)
- Orphan realtime UPDATE without cache `previous` needs a dedicated upsert path
- Contributors must find the hub before sprinkling `setQueryData`

### Follow-up

- [entities/note/docs/read-models.md](../../entities/note/docs/read-models.md)
- [docs/architecture/caching.md](../architecture/caching.md)
- ADR 0010 — one domain, multiple consumers (Home)
