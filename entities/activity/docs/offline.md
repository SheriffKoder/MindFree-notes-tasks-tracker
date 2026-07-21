# Offline

How Activity (definitions + daily records) stays usable without a network, then
converges when online again.

**Decision:** [ADR 0009](../../../docs/adr/0009-offline-writes-simple-queue.md)  
**Shared HOW:** [shared/offline-queue/README.md](../../../shared/offline-queue/README.md)  
**Adapter:** `entities/activity/offline/activity-offline-storage.ts`  
**Flush → hub:** `entities/activity/offline/activity-change-from-offline.ts`

---

## Mental model

```text
Offline save
  → localStorage pending write (this user only)
  → optimistic TanStack patch (definitions + month records → Home Today)
  → UI “saved”

Online again / focus
  → flush pending → API
  → ActivityChange → synchronizeActivityCaches
  → remove pending key

Other tab (still offline)
  → storage event → merge → cache update
```

No CRDT. No merge UI. **Last write wins** per resource key (`savedAt` >
cached `updatedAt`).

---

## Activity-specific pieces

| Concern | Where |
| ------- | ----- |
| Definition create / patch / archive / restore / delete | `activity-offline-storage.ts` |
| Record upsert / delete (natural key) | Same adapter |
| Optimistic apply while offline | Same adapter → `synchronizeActivityCaches` |
| Flush after reconnect | `useOfflineSync` + activity adapter |
| Config orchestrator branch | `use-config-orchestrator` checks `isOnline()` before mutate |
| Quick-record / picker branch | `use-quick-record`, `ActivityRecordTaskPicker` |

Keys:

| Operation | Key |
| --------- | --- |
| create (draft) | `activity:draft:{kind}` + pinned id `optimistic-{kind}-draft` |
| patch / archive / restore / delete | `activity:{activityId}` |
| record-upsert / record-delete | `record:{taskId}:{date}` |

Same key → overwrite. A later `record-delete` replaces a pending `record-upsert`
for that day. Flush **collapses** draft create + patch-on-pinned-id into one
create when both keys exist; create flush reconciles optimistic id → server id
without purging warm records.

One adapter entity string: `"activity"` (definitions and records share the
adapter; keys keep them apart).

---

## Mount points

| Surface | Where |
| ------- | ----- |
| Tasks / Reminders | `features/activity/activity-page/ui/activity-page-client.tsx` — `useOfflineSync` + `OfflineBanner` |
| Home | `views/home/ui/home-activity-offline.tsx` (once from `views/home/index.tsx`) + `OfflineBanner` |
| Progress | Banner only (`ProgressPageShell`) — no sync mount (pure SSR) |

Home must mount even though definition edits happen only on Tasks/Reminders:
pending writes live in user-scoped `localStorage`, and Home originates record
writes via `QuickRecordCard`.

---

## Limits (v1)

- Two devices editing the same activity/record offline can overwrite by timestamp
- localStorage only — form snapshots, not attachments
- Banner indicates offline; it does not block editing
- Progress stays SSR-only — offline flush does not live-patch Progress

---

## Related

| Doc | Why |
| --- | --- |
| [realtime.md](./realtime.md) | Online multi-tab/device path |
| [writes-and-autosave.md](./writes-and-autosave.md) | Same actions + cache hub after flush |
| [progress.md](./progress.md) | Why Progress stays out of live caches |
| Notes mirror | [entities/note/docs/offline.md](../../note/docs/offline.md) |
