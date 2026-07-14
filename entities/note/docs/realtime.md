# Realtime

How Notes keep TanStack read models fresh across tabs and devices without full page refresh.

**Decision:** [ADR 0008](../../../docs/adr/0008-realtime-postgres-changes.md)  
**Hub:** [ADR 0007](../../../docs/adr/0007-synchronize-note-caches-hub.md)  
**Code:** `entities/note/tanstack/use-notes-realtime-sync.ts`, `apply-realtime-note-change.ts`

---

## What “live sync” means here

1. Browser opens a Supabase channel on `mf_notes` for the signed-in `user_id`.
2. Postgres change events arrive as INSERT / UPDATE / DELETE.
3. Adapter maps rows → domain notes → `synchronizeNoteCaches`.
4. Notes page, Home strip, and any open drawer **cache** see the update.

It is **not** polling and **not** a second copy of note state beside TanStack.

---

## Safety gates

| Gate | Purpose |
| ---- | ------- |
| `lastEditedAt` newer-wins | Ignore older UPDATE payloads vs current cache |
| Mutation pending set | Reduce applying your own in-flight write echo |
| Drawer sync guard | Do not bump `remoteSyncKey` into a dirty / non-idle form |

Cache can move under an open editor; **form fields** only pull remote values when the guard allows (idle, clean). See [optimistic-updates.md](./optimistic-updates.md).

---

## Mount points

Realtime hooks are mounted from page-level client islands (Notes client, Home notes section) so subscriptions exist while those surfaces are active — not from the dumb form.

---

## Related

| Doc | Why |
| --- | --- |
| [offline.md](./offline.md) | Offline path when realtime is unavailable |
| [writes-and-autosave.md](./writes-and-autosave.md) | Local writes that realtime will echo |
| [RESPONSIBILITIES.md](../RESPONSIBILITIES.md) | Realtime file map |
