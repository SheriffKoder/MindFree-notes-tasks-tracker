# Offline

How Notes keep editing usable without a network, then converge when online again.

**Decision:** [ADR 0009](../../../docs/adr/0009-offline-writes-simple-queue.md)  
**Shared HOW:** [shared/offline-queue/README.md](../../../shared/offline-queue/README.md)  
**Adapter:** `entities/note/offline/notes-offline-storage.ts`

---

## Mental model

```text
Offline save
  → localStorage pending write (this user only)
  → optimistic TanStack patch (incl. home)
  → UI “saved”

Online again / focus
  → flush pending → API
  → NoteChange → synchronizeNoteCaches
  → remove pending key

Other tab (still offline)
  → storage event → merge → cache update
```

No CRDT. No merge UI. **Last write wins** per resource key.

---

## Notes-specific pieces

| Concern | Where |
| ------- | ----- |
| Patch / create-calendar / create-general / create-quick / delete payloads | Notes offline storage |
| Optimistic apply while offline | Same adapter (hub) |
| Flush after reconnect | `useOfflineSync` + notes adapter |
| Orchestrator branch | `use-pre-save-orchestrator` checks `isOnline()` before mutate |

Keys include note id, calendar draft day, general draft, and `note:quick` so resources do not collide.

---

## Limits (v1)

- Two devices editing the same note offline can overwrite each other by timestamp
- localStorage only — note text sized, not attachments
- Banner indicates offline; it does not block editing

---

## Related

| Doc | Why |
| --- | --- |
| [realtime.md](./realtime.md) | Online multi-tab/device path |
| [writes-and-autosave.md](./writes-and-autosave.md) | Same actions, different transport |
| [ADR 0007](../../../docs/adr/0007-synchronize-note-caches-hub.md) | Cache updates after flush |
