# Home Today list

Why Home renders today's tasks as an inline recording surface — and what the
Home view must not own.

**Activity model:** [entities/activity/docs/domain-model.md](../../../entities/activity/docs/domain-model.md)  
**Read models:** [entities/activity/docs/read-models.md](../../../entities/activity/docs/read-models.md)  
**Record writes:** [entities/activity/docs/writes-and-autosave.md](../../../entities/activity/docs/writes-and-autosave.md)  
**Workflow archive:** `app/development/workflow/activity/substeps/2-home-today-plan.md`

---

## What you see

```text
Home "Today's Tasks"
  └─ HomeTodayList
       └─ ActivityTodayCard
            ├─ identity + derived progress
            ├─ inline QuickRecord controls
            └─ optional record description
```

The cards edit the activity's record for today inline. They do not open the
activity-definition drawer or introduce a record drawer. Definition editing
stays on `/tasks`.

---

## Home's job

| Owns | Does not own |
| ---- | ------------ |
| Section/card composition and layout | Activity or record domain rules |
| Mount `useHomeTodayQuery` | A Home-only query key or cache |
| Inject `QuickRecord` into each card | Record API calls or cache mutation logic |
| Render pending, error, and empty states | A second save/sync pipeline |
| Future realtime/offline mount points | Activity-definition editing |

`useHomeTodayQuery` is a memoized selector over
`["activities", "task"]` and `["activityRecords", currentMonth]`. The Home
route seeds those same canonical caches during SSR, so the list has no private
Home payload and no initial client refetch flash.

---

## Today membership and progress

`buildTodayActivities` joins task definitions with today's record. An
unarchived task appears when it is scheduled today or already has a record for
today. The record wins over later schedule edits, matching the calendar's
history-always-visible rule.

`deriveTodayProgress` owns goal-aware completion, remaining value, and percent.
Card-specific presentation may show count and duration as separate segments,
but Home does not recalculate domain completion.

---

## Inline recording

`QuickRecord` dispatches controls from `trackingMode`:

- `boolean` — done toggle;
- `count` — count stepper;
- `duration` — minute stepper and timer;
- `count+duration` — both count and minute controls.

`useQuickRecord` updates local values immediately, then debounces an absolute
record upsert for 500 ms. Returning all meaningful dimensions to zero deletes
an existing record instead. The entity mutation hooks own optimistic cache
updates, rollback, and server reconciliation.

The duration timer is client-local. While running it adds one minute every
60 seconds through the same `useQuickRecord` path. Stopping preserves the
current value; reload resumes from persisted minutes, not elapsed wall-clock
time. Background-tab interval throttling is accepted for the current MVP.

---

## Consistency

```text
QuickRecord
  → useQuickRecord
  → record mutation hook
  → synchronizeActivityCaches
  → ["activityRecords", month]
  → Home Today + Tasks calendar + Progress recompute
```

Home does not have a branch in the synchronization hub. Every consumer derives
from the same definitions and month-record caches.

---

## Related

| Doc | Why |
| --- | --- |
| [notes-strip.md](./notes-strip.md) | Parallel Home-consumer ownership doctrine |
| [ADR 0014](../../../docs/adr/0014-flat-records-client-side-join.md) | Why records stay flat and views join client-side |
| [ADR 0012](../../../docs/adr/0012-calendar-records-always-visible.md) | Why recorded history survives schedule changes |
