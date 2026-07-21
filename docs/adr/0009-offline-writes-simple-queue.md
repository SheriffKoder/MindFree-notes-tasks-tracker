## ADR 0009: Simple offline writes (per-user queue)

### Status

Accepted

### Context

Autosave feels broken on flaky mobile networks if failed PATCHes only show an error. A full CRDT / op-log offline stack was discussed and rejected as overkill for note form snapshots.

Need:

- Persist intent while offline
- Survive tab close
- Not mix User A and User B on a shared device
- Replay when back online
- Prefer simple over clever merge UI (v1)

### Decision

1. Shared package `shared/offline-queue`: user-scoped `localStorage`, online listener, page hook (`useOfflineSync`), banner.
2. Entity **adapter** (notes: `notes-offline-storage.ts`; activity:
   `activity-offline-storage.ts`) owns payload shape, optimistic cache apply,
   merge-on-load, flush-to-API.
3. Orchestrator: when a debounced mutation would run and `!isOnline()`, write pending storage + optimistic cache + “saved” UI — skip network.
4. **Last-write-wins** per resource key (`savedAt` vs server `lastEditedAt` on merge).
5. Flush on reconnect and window focus; remove key on success.
6. Listen for cross-tab `storage` events so sibling tabs merge without polling.
7. Successful flush maps into the entity change type → sync hub
   (`NoteChange` → `synchronizeNoteCaches`; `ActivityChange` →
   `synchronizeActivityCaches`).

### Why (simple vs complex)

| Simple (shipped) | Complex (deferred) |
| ---------------- | ------------------ |
| One pending blob per note/resource key | Ordered op queue with replay cursor |
| Last-write-wins | Field-level merge / conflict UI |
| localStorage | IndexedDB + blob attachments |
| Entity adapter + 3 shared files | Generic enterprise sync framework |

Rejected complex queue for Notes v1: notes are small text snapshots; conflict UI was not a product requirement yet.

### Consequences

Positive:

- Offline typing still updates lists/Home via optimistic cache
- Users never share a storage bucket (`offline-writes:{userId}`)
- Cross-tab offline edits become visible via `storage`

Trade-offs:

- No semantic merge if two devices edit the same note offline
- localStorage size limits — fine for note forms, not for large media
- Clock skew affects `savedAt` comparisons

### Follow-up

- [shared/offline-queue/README.md](../../shared/offline-queue/README.md)
- [entities/note/docs/offline.md](../../entities/note/docs/offline.md)
- [entities/activity/docs/offline.md](../../entities/activity/docs/offline.md)
  (Activity adapter shipped — same ADR contract)
- Workflow offline plans under `app/development/workflow/`
