# Realtime

How Activity (tasks + reminders) keeps TanStack read models fresh across tabs
and devices without a full page refresh.

- **Decision:** [ADR 0008](../../../docs/adr/0008-realtime-postgres-changes.md)
- **Hub:** `entities/activity/cache/synchronize-activity-caches.ts`
- **Subscription:** `entities/activity/hooks/use-activity-realtime-sync.ts`
- **Application (definitions):** `entities/activity/cache/apply-realtime-activity-change.ts`
- **Application (records):** `entities/activity/cache/apply-realtime-activity-record-change.ts`
- **Pending trackers:** `hooks/activity-mutation-pending.ts`,
  `hooks/record/record-mutation-pending.ts`
- **Migration:** `supabase/migrations/007_realtime_activities.sql`

---

## What “live sync” means here

1. Browser opens one Supabase channel for the signed-in `user_id` on **both**
   `mf_task` and `mf_task_record` (filter by `user_id` only — not by `kind`).
2. Postgres change events arrive as INSERT / UPDATE / DELETE.
3. Cache adapters map rows → domain objects, apply safety gates, then call
   `synchronizeActivityCaches`.
4. Tasks, Reminders, and Home Today **caches** see the update. List / calendar /
   Today recompute from the same two keys (`["activities", kind]` +
   `["activityRecords", month]`).

It is **not** polling and **not** a second copy of activity state beside
TanStack.

**Progress is excluded.** Progress is pure SSR (`getProgressPageData`) with no
TanStack hydrate. Visiting Progress (or changing `?month=`) gets a fresh RSC
payload — realtime does not patch a Progress cache.

---

## Responsibility split

`hooks/use-activity-realtime-sync.ts` owns React and Supabase subscription
lifecycle: resolve the signed-in user, subscribe with a user filter on both
tables, forward events to the matching apply adapter, invoke optional callbacks
after an accepted cache patch, and remove the channel on cleanup.

`cache/apply-realtime-activity-change.ts` and
`cache/apply-realtime-activity-record-change.ts` are framework-independent
application logic: map Supabase rows through `lib/mapping/map-row.ts`, reject
mutation echoes and stale updates, skip cold month buckets for records, and
send one normalized `ActivityChange` through the hub.

This split keeps reconnect/mount concerns out of cache policy and lets every
accepted remote event use the same membership rules as local mutations (and
future offline reconciliation).

---

## Safety gates

| Gate | Purpose |
| ---- | ------- |
| `updatedAt` newer-wins (definitions) | `isRemoteActivityNewer` — ignore older UPDATE vs cache |
| `updatedAt` newer-wins (records) | `isRemoteRecordNewer` — same for `(taskId, date)` |
| Mutation pending (definitions) | Skip in-flight local write echoes by activity id |
| Mutation pending (records) | Skip in-flight echoes by natural key `(taskId, date)` |
| Warm month only (records) | Do not create empty `["activityRecords", month]` from realtime alone |
| Drawer sync guard | Do not bump `remoteSyncKey` into a dirty / non-idle definition form |

Cache can move under an open definition drawer; **form fields** only pull remote
values when the guard allows (idle, clean). See
[writes-and-autosave.md](./writes-and-autosave.md).

Record drawer / quick-record rely on cache re-render for v1 (no form
`remoteSyncKey`).

---

## Mount points

`useActivityRealtimeSync` is mounted from page-level client islands — not from
reusable entity forms:

| Surface | Mount |
| ------- | ----- |
| Tasks + Reminders | `features/activity/activity-page/ui/activity-page-client.tsx` (one call; `onActivityChange` → drawer bridge) |
| Home | `views/home/ui/home-activity-realtime.tsx` once from `views/home/index.tsx` |
| Progress | **Not mounted** (SSR-only) |

Do **not** mount inside both `home-today-list` and `home-reminders-list`.

Definition drawer remote pull:

- Bridge: `features/activity/activity-drawer/model/activity-realtime-drawer-bridge.ts`
- Guard: `…/activity-editor-sync-guard.ts`
- Wiring: `…/use-activity-drawer-realtime-sync.ts` → `remoteSyncKey` on
  `entities/activity/editor`

---

## Related

| Doc | Why |
| --- | --- |
| [writes-and-autosave.md](./writes-and-autosave.md) | Local writes that realtime will echo |
| [read-models.md](./read-models.md) | Cache keys Home/Tasks share |
| [progress.md](./progress.md) | Why Progress stays SSR-only |
| [responsibilities.md](./responsibilities.md) | Realtime file map |
| Notes mirror | [entities/note/docs/realtime.md](../../note/docs/realtime.md) |
| Caching overview | [docs/architecture/caching.md](../../../docs/architecture/caching.md) |
