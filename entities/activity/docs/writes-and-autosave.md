# Writes and autosave

How definition autosave and inline daily recording decide **what** to write,
and how each change fans out to every Activity consumer.

**Decision (pure):** `features/activity/activity-drawer/pre-save-orchestrator/evaluate-activity-save.ts`
**Orchestrator (hook):** `features/activity/activity-drawer/model/use-config-orchestrator.ts`
**Record orchestrator:** `features/activity/quick-record/model/use-quick-record.ts`
**Cache hub:** `entities/activity/cache/synchronize-activity-caches.ts`

---

## Design principles

1. **Lazy create** — an empty draft inserts no row; the first meaningful
   **title** does.
2. **Autosave** — field edits debounce (~600ms) into a patch; no Save button.
3. **One interpreter** — `evaluateActivitySave` picks the action; the hook only
   schedules it, mutations only apply it.
4. **Imperative lifecycle** — archive / restore / delete are explicit buttons,
   never inferred from empty fields.
5. **Cache-first** — optimistic update, server confirms, stale responses gated
   by `updatedAt`.

---

## Definition actions

`evaluateActivitySave` is deliberately simpler than the Notes orchestrator —
**no date routing, no conflict gate, no auto-delete:**

| Action | When |
| ------ | ---- |
| `create` | no id yet, form valid, has a meaningful title |
| `patch` | existing id, dirty, valid |
| `noop` | invalid, not dirty, or empty draft |

"Meaningful" here is just a non-empty title (`hasMeaningfulContent`). Activities
are never deleted by clearing fields — clearing a title just parks the draft at
`noop`.

---

## Path online

```text
form onChange
  → evaluateActivitySave (create | patch | noop)
  → noop? clear pending          otherwise debounce (~600ms)
  → TanStack mutation (create | patch)
       onMutate  → synchronizeActivityCaches (optimistic)
       onSuccess → reconcile only if server row is newer (isRemoteActivityNewer)
       onError   → restore snapshot
```

Archive / restore / delete **skip the debounce** — they cancel any pending
autosave and fire immediately, each flipping the drawer's save status.

API surfaces (thin routes → `server.ts` use-cases):

- `POST /api/activities` — create (`kind` from the route/page, not the body)
- `PATCH /api/activities/:id` — field edits **and** archive/restore (via
  `archivedAt`)
- `DELETE /api/activities/:id` — hard delete

Status codes match the Notes API: 400 invalid body, 401 unauthenticated, 404 not
found, 500 otherwise.

---

## Daily record path

Home's inline controls edit the aggregate record identified by the natural key
`(taskId, date)`. Values are absolute daily totals, not increment commands, so
retries remain idempotent.

```text
QuickRecord control
  → useQuickRecord updates local count/duration immediately
  → debounce 500 ms
       meaningful for effective trackingMode → useUpsertActivityRecordMutation
       empty existing record                 → useDeleteActivityRecordMutation
       empty with no record                  → no write
  → POST or DELETE /api/activity-records
  → synchronizeActivityCaches
  → ["activityRecords", YYYY-MM]
  → Home Today + Tasks calendar + Progress recompute
```

`features/activity/quick-record/model/use-quick-record.ts` owns the **when**
(debounce) and **whether** (upsert/delete/noop). It resolves the **effective**
tracking mode via `resolveRecordConfiguration` (record snapshots when present,
otherwise the activity's current mode) for controls, boolean `done`, and
delete-on-empty. It preserves the other tracked dimension and record
description while changing one control. The entity mutation hooks remain
single-write executors.

`isMeaningfulRecord` is the one delete-on-empty predicate (called with the
effective mode):

- `boolean` / `count` — count is positive;
- `duration` — duration is positive;
- `count+duration` — either dimension is positive.

The timer adds one minute through `useQuickRecord.addMinutes`, so timed and
manual edits use exactly the same persistence path.

Record API surfaces (thin route → record mutation use-cases):

- `POST /api/activity-records` — natural-key upsert with absolute
  count/duration/description plus form-owned configuration snapshots
  (`trackingModeSnapshot`, `goalSnapshot`, `goalDurationSnapshot`);
- `DELETE /api/activity-records` — remove by `(taskId, date)`.

Both mutation hooks optimistically update only the target month bucket and
restore its snapshot on error. Upsert success uses `isRemoteRecordNewer` before
replacing the optimistic row; pending natural keys provide the future realtime
echo-suppression seam.

Optimistic rows apply the submitted `trackingMode` / `goal` / `goalDuration`
(`hooks/record/build-optimistic-activity-record.ts`). The server response then
replaces the row with persisted values.

---

## The cache hub

Every write source maps its event into one `ActivityChange` and calls
`synchronizeActivityCaches` once — callers never scatter `setQueryData`:

```text
ActivityChange =
  | create | update | archive | restore   → upsert definition in ["activities", kind]
  | delete                                → remove definition + purge records
                                            from every ["activityRecords", *] month
  | record-upsert                         → upsert record in its YYYY-MM bucket
  | record-delete                         → remove record from its YYYY-MM bucket
```

The fan-out is intentionally small. Home Today and Progress derive from the same
two caches ([read-models.md](./read-models.md)), so there is **no separate Home
patch branch**. A record change touches one month bucket; a definition change
touches its kind bucket. Definition `delete` additionally purges the task from
all cached months (`purge-activity-records-in-cache`), because its history no
longer has an owner.

Pure cache updaters (`cache/activity-cache-mutations.ts`,
`cache/record/*`, `purge-activity-records-in-cache.ts`) take no `QueryClient` —
the hub applies them to the relevant cache entries, keeping them unit-testable
in isolation
(`synchronize-activity-caches.test.ts`).

---

## Newer-wins reconciliation

Definition `onSuccess` re-applies the server row only when
`isRemoteActivityNewer` says it is newer than what's cached. Record upserts use
the equivalent `isRemoteRecordNewer` gate for `(taskId, date)`. Both compare
`updatedAt`, preventing a slow response from clobbering a later edit and
providing the same gate a realtime adapter will reuse (Phase 5).

`hooks/activity-mutation-pending.ts` tracks in-flight definition ids;
`hooks/record/record-mutation-pending.ts` tracks in-flight record natural keys,
so a future realtime subscription can skip echoing its own writes.

---

## Offline & realtime (deferred)

Both remain inert seams:

- **Realtime (Phase 5)** — a `postgres_changes` subscription would map events to
  the same `ActivityChange` hub, gated by the matching definition/record
  newer-wins check and mutation-pending registry.
- **Offline (Phase 6)** — a queue adapter would persist pending writes and flush
  them through the same hub.

The mount points are commented in `views/tasks/ui/tasks-client.tsx` and
`views/home/ui/home-today-list.tsx`; no throwaway code exists yet.

---

## Related

| Doc | Why |
| --- | --- |
| [domain-model.md](./domain-model.md) | Lifecycle: create → archive/restore → delete |
| [read-models.md](./read-models.md) | The two caches the hub keeps consistent |
| [responsibilities.md](./responsibilities.md) | `mutations/`, `cache/`, `hooks/` file map |
| [views/home/docs/today-list.md](../../../views/home/docs/today-list.md) | Home's inline-recording consumer boundary |
