## ADR 0008: Realtime via Supabase `postgres_changes`

### Status

Accepted

### Context

Users open MindFree on phone and laptop (or two browser tabs). TanStack cache on one client does not automatically see another client’s writes. Polling felt wrong for notes; full-page refresh breaks the “drawer + warm calendar” UX.

We already trust Supabase for auth and `mf_notes` + RLS. Realtime on the same table reuses that security model.

### Decision

1. Subscribe to `postgres_changes` on `mf_notes` from a client hook (`useNotesRealtimeSync`): INSERT/UPDATE filtered by `user_id=eq.<auth user>`; DELETE unfiltered (Realtime cannot reliably filter DELETE on non-PK columns). Apply adapters only clear rows already present in warm TanStack caches.
2. Map INSERT / UPDATE / DELETE rows into domain `Note` values and call **`synchronizeNoteCaches`** (via `applyRealtimeNoteChange`).
3. **Gate UPDATE** with `isRemoteNoteNewer` (`lastEditedAt`) so older realtime echoes do not clobber newer optimistic cache.
4. **Skip** applying realtime for note ids with an in-flight local mutation (`note-mutation-pending`) to reduce self-echo fights.
5. Drawer may pull remote fields into the form only when idle and not dirty (`remoteSyncKey` + editor sync guard) — cache can update under the editor without wiping keystrokes.
6. Tables that participate in realtime use `REPLICA IDENTITY FULL` so `old` can carry non-PK columns when the platform allows (`008_realtime_replica_identity.sql`).

### Why

- Multi-device and multi-tab without inventing a custom websocket protocol
- Same hub as mutations (ADR 0007) — Home and Notes both benefit
- RLS + filter keep events scoped to the signed-in user

Rejected:

- **Polling intervals** — laggy and wasteful for sparse edits
- **Broadcast-only channels** — bypasses DB as source of truth
- **Always reset the open form from cache** — caused optimistic snap / rollback (see optimistic-updates doc)

### Consequences

Positive:

- Laptop save appears on phone without manual refresh
- Starred / quick / calendar stay coherent across tabs when online

Trade-offs:

- Requires Realtime enabled for the table/publication in Supabase
- DELETE subscriptions are unfiltered; cache-membership gates drop other users’ ids
- Timestamp-only newer-wins can still admit edge races under skewed clocks; content-aware gates are possible follow-ups
- Dirty-form publish must be timely (sync guard) or a remote bump can sneak mid-keystroke

### Follow-up

- [entities/note/docs/realtime.md](../../entities/note/docs/realtime.md)
- [entities/note/docs/optimistic-updates.md](../../entities/note/docs/optimistic-updates.md)
