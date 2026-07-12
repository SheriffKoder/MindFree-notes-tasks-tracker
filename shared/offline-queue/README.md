# Offline queue (`shared/offline-queue`)

Simple offline writes: **localStorage per user**, **last-write-wins on load**, **flush on reconnect**.

Works for any entity — notes today; tasks/reminders add their own transformer + adapter.

## Files (shared)

| File | Role |
| ---- | ---- |
| `lib/offline-store.ts` | `isOnline`, user-scoped `localStorage` read/write/remove |
| `hooks/use-online-status.ts` | `navigator.onLine` + `online`/`offline` listener |
| `hooks/use-offline-sync.ts` | Page hook — merge on load, flush on reconnect/focus |
| `ui/offline-banner.tsx` | Quiet top-right indicator while offline |

Entity-specific logic lives outside this folder (e.g. `entities/note/offline/notes-offline-storage.ts`).

## Flow

```text
SAVE (orchestrator)
  debounced mutation ready
    → offline? → entity transformer → saveOfflineWrite(userId, entity, key, payload, time)
                 → apply optimistic cache → mark saved
    → online?  → normal TanStack mutation

LOAD (page)
  server fetch (unchanged)
  → getOfflineWrites(userId, entity)
  → for each item: if local.savedAt > server.lastEditedAt → patch TanStack cache

RECONNECT
  online or window focus
  → flush each stored write via entity adapter
  → success → removeOfflineWrite
```

## Storage shape

```text
localStorage["offline-writes:{userId}"] = {
  "note:abc-id": { userId, entity, key, payload, savedAt },
  "note:calendar:2026-07-12": { ... },
}
```

One key per resource — each save overwrites (last-win per note). Users never share a bucket.

## Adding another entity

1. Add `entities/<name>/offline/<name>-offline-storage.ts` — payload type, `toOfflineWrite`, `applyToCache`, `merge`, `flush`.
2. Register adapter in the page hook:

```tsx
useOfflineSync(userId, [createNotesOfflineSyncAdapter(queryClient)]);
```

3. In that entity's save path: `if (!isOnline()) { saveOfflineWrite(...); applyToCache(...); return; }`

## Touches (notes)

| File | Change |
| ---- | ------ |
| `use-pre-save-orchestrator.ts` | Offline guard before mutation dispatch |
| `note-drawer.tsx` | Pass `userId` into orchestrator |
| `notes-client.tsx` | `OfflineBanner` + `useOfflineSync` + `useAuthUserId` |

## Limits (v1)

- Last-write-wins by `savedAt` vs `lastEditedAt` — no merge UI for content conflicts.
- `localStorage` only — fine for note form snapshots; not for large blobs.
- Flush is sequential, one entity adapter at a time.
