# Realtime

How Notes keep TanStack read models fresh across tabs and devices without full page refresh.

- **Decision:** [ADR 0008](../../../docs/adr/0008-realtime-postgres-changes.md)
- **Hub:** [ADR 0007](../../../docs/adr/0007-synchronize-note-caches-hub.md)
- **Subscription:** `entities/note/hooks/use-notes-realtime-sync.ts`
- **Application:** `entities/note/cache/apply-realtime-note-change.ts`
- **Pending tracker:** `entities/note/hooks/note-mutation-pending.ts`

---

## What “live sync” means here

1. Browser opens a Supabase channel on `mf_notes` for the signed-in `user_id`.
2. Postgres change events arrive as INSERT / UPDATE / DELETE.
3. The cache adapter maps rows → domain notes, applies safety gates, then calls
   `cache/synchronize-note-caches.ts`.
4. Notes page, Home strip, and any open drawer **cache** see the update.

It is **not** polling and **not** a second copy of note state beside TanStack.

### DELETE delivery caveat

Supabase `postgres_changes` filters on non-PK columns (e.g. `user_id`) do **not**
reliably match DELETE events: default replica identity only puts the primary key
in `old`, and Realtime documents DELETE filtering as limited even with
`REPLICA IDENTITY FULL` (`supabase/migrations/008_realtime_replica_identity.sql`).

So the subscription uses:

| Event | Filter |
| ----- | ------ |
| INSERT / UPDATE | `user_id=eq.<auth user>` |
| DELETE | none |

`applyRealtimeNoteChange` only removes a note when that id is already present in
a warm TanStack cache — other users’ DELETE noise is a no-op.

## Responsibility split

`hooks/use-notes-realtime-sync.ts` owns React and Supabase subscription
lifecycle: resolve the signed-in user, subscribe with a user filter on
INSERT/UPDATE and an unfiltered DELETE listener, forward events, invoke the
optional callback after an accepted cache patch, and remove the channel on
cleanup.

`cache/apply-realtime-note-change.ts` is framework-independent application
logic: map Supabase rows through `transform/map-note-row.ts`, reject mutation
echoes and stale updates, recover prior membership when possible, and send one
normalized change through `cache/synchronize-note-caches.ts`.

This split keeps reconnect/mount concerns out of cache policy and lets every
accepted remote event use the same calendar/general/Home membership rules as
local mutations and offline reconciliation.

---

## Safety gates

| Gate | Purpose |
| ---- | ------- |
| `lastEditedAt` newer-wins | Ignore older UPDATE payloads vs current cache |
| Mutation pending set | `hooks/note-mutation-pending.ts` tracks ids so application logic can skip an in-flight local write echo |
| DELETE cache membership | Unfiltered DELETE only clears ids already in warm caches |
| Drawer sync guard | Do not bump `remoteSyncKey` into a dirty / non-idle form |

Cache can move under an open editor; **form fields** only pull remote values when the guard allows (idle, clean). See [optimistic-updates.md](./optimistic-updates.md).

The pending tracker is intentionally colocated with mutation hooks because
those hooks mark and clear the ids. Realtime application reads the tracker, but
the tracker does not own cache updates.

---

## Mount points

`useNotesRealtimeSync` is mounted from page-level client islands
(`views/notes/ui/notes-client.tsx` and
`views/home/ui/home-notes-section.tsx`) so subscriptions exist while those
surfaces are active — not from the reusable entity form.

---

## Related

| Doc | Why |
| --- | --- |
| [offline.md](./offline.md) | Offline path when realtime is unavailable |
| [writes-and-autosave.md](./writes-and-autosave.md) | Local writes that realtime will echo |
| [RESPONSIBILITIES.md](../RESPONSIBILITIES.md) | Realtime file map |
