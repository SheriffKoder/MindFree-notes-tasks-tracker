# Writes and autosave

How the config drawer decides **what** to write (create / patch / noop), how
archive/restore/delete fire, and how one change fans out to every cache.

**Decision (pure):** `features/activity/activity-drawer/pre-save-orchestrator/evaluate-activity-save.ts`
**Orchestrator (hook):** `features/activity/activity-drawer/model/use-config-orchestrator.ts`
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

## Actions

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

## The cache hub

Every write source maps its event into one `ActivityChange` and calls
`synchronizeActivityCaches` once — callers never scatter `setQueryData`:

```text
ActivityChange =
  | create | update | archive | restore   → upsert definition in ["activities", kind]
  | delete                                → remove definition + purge records
                                            from every ["activityRecords", *] month
```

The fan-out is intentionally small. Home Today and Progress derive from the same
two caches ([read-models.md](./read-models.md)), so there is **no separate Home
patch branch** — upserting the definition updates every consumer. Only `delete`
touches records, purging the task from all cached months
(`purge-activity-records-in-cache`), because its history no longer has an owner.

Pure cache updaters (`cache/activity-cache-mutations.ts`,
`purge-activity-records-in-cache.ts`) take no `QueryClient` — the hub loops them
over cache entries, keeping them unit-testable in isolation
(`synchronize-activity-caches.test.ts`).

---

## Newer-wins reconciliation

`onSuccess` re-applies the server row only when `isRemoteActivityNewer`
(strict `updatedAt` compare) says it is newer than what's cached. This stops a
slow create/patch response from clobbering a later edit, and is the same gate a
realtime adapter will reuse (Phase 5).

`hooks/activity-mutation-pending.ts` tracks in-flight ids so a future realtime
subscription can skip echoing its own writes.

---

## Offline & realtime (deferred)

Both are inert seams in Phase 1:

- **Realtime (Phase 5)** — a `postgres_changes` subscription would map events to
  the same `ActivityChange` hub, gated by `isRemoteActivityNewer` +
  `activity-mutation-pending`.
- **Offline (Phase 6)** — a queue adapter would persist pending writes and flush
  them through the same hub.

The mount points are commented in `views/tasks/ui/tasks-client.tsx`; no throwaway
code exists yet.

---

## Related

| Doc | Why |
| --- | --- |
| [domain-model.md](./domain-model.md) | Lifecycle: create → archive/restore → delete |
| [read-models.md](./read-models.md) | The two caches the hub keeps consistent |
| [responsibilities.md](./responsibilities.md) | `mutations/`, `cache/`, `hooks/` file map |
