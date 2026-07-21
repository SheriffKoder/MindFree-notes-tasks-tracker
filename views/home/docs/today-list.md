# Home Today list

Why Home renders today's tasks and reminders as inline recording surfaces — and
what the Home view must not own.

**Activity model:** [entities/activity/docs/domain-model.md](../../../entities/activity/docs/domain-model.md)  
**Read models:** [entities/activity/docs/read-models.md](../../../entities/activity/docs/read-models.md)  
**Record writes:** [entities/activity/docs/writes-and-autosave.md](../../../entities/activity/docs/writes-and-autosave.md)  
**Workflow archive:** `app/development/workflow/activity/substeps/2-home-today-plan.md`

---

## What you see

```text
Home
  ├─ HomeActivityRealtime ─── useActivityRealtimeSync() once
  ├─ "Today's Tasks"
  │    └─ HomeTodayList ─────── useHomeTodayQuery("task")
  │         └─ HomeTodayPriorityList  (High → Medium → Low → Other; omit empty)
  └─ "Today's Reminders"
       └─ HomeRemindersList ─── useHomeTodayQuery("reminder")
            └─ HomeTodayPriorityList  (same buckets; reminders land in Other)

Both lists
  └─ QuickRecordCard
       └─ ActivityTodayCard
            ├─ identity + entity-derived progress
            ├─ mode-appropriate QuickRecord controls
            └─ optional record description
```

Priority sections are always open (no collapse). Section labels use the same
muted header style as "Today's Tasks" and are inset to align with that title
text (past the summary chevron). Unset priority shows as **Other**.
The cards edit the activity's record for today inline. They do not open the
activity-definition drawer or introduce a record drawer. Definition editing
stays on `/tasks` or `/reminders`; selected-day editing stays in those pages'
shared records drawer.

---

## Home's job

| Owns | Does not own |
| ---- | ------------ |
| Section/card composition and layout | Activity or record domain rules |
| Mount `useHomeTodayQuery(kind)` for each section | A Home-only query key or cache |
| Group today's rows by priority for display | Priority persistence or editor |
| Render `QuickRecordCard` for each item | Record API calls or cache mutation logic |
| Render pending, error, and empty states | A second save/sync pipeline |
| Mount realtime once via `HomeActivityRealtime` | Duplicate mounts inside both lists |
| Future offline mount (Phase 6) | Activity-definition editing |

`useHomeTodayQuery(kind)` is a memoized selector over the matching
`["activities", kind]` bucket and `["activityRecords", currentMonth]`. Tasks and
reminders therefore share one month-record cache without mixing their
definitions.

The Home route fetches both definition kinds and one records month through
`getHomeActivityInitialData`, then `seedHomeActivityCaches` writes all three
canonical keys during SSR. Neither list has a private Home cache or an initial
client-refetch flash.

---

## Today membership and progress

`buildTodayActivities` joins one kind's definitions with today's records. An
unarchived activity appears when it is scheduled today or already has a record
today. The record wins over later schedule edits, matching the calendar's
history-always-visible rule. Passing a kind-scoped definitions bucket makes the
same membership rule serve both Home sections.

`deriveTodayProgress` owns per-dimension value / goal / remaining / percent and
goal-aware `done`, using `resolveRecordConfiguration` so recorded days keep
their frozen mode/goals. Home cards render those dimensions as:

- stacked `value/goal` lines (`Xm/Ym` for minutes);
- `Count:` / `Minutes:` prefixes only when both dimensions are present;
- one donut before the title — the average of bounded percents (presentation
  only; completion stays per-dimension in the entity).

Home does not recalculate domain completion or invent a second progress model.
Tasks render their numeric dimensions and donut. Reminders are normalized to
boolean tracking with no goals, so they render done/not-done without numeric
goal progress.

---

## Inline recording

`QuickRecord` dispatches controls from the **effective** tracking mode (record
snapshot when present, otherwise `activity.trackingMode`):

- `boolean` — done toggle;
- `count` — count stepper;
- `duration` — minute stepper and timer;
- `count+duration` — both count and minute controls, each labeled.

`useQuickRecord` updates local values immediately, then debounces an absolute
record upsert for 500 ms. Count and duration edits preserve the other
dimension. Returning all meaningful dimensions to zero deletes an existing
record instead. The entity mutation hooks own optimistic cache updates,
rollback, and server reconciliation.

Record configuration snapshots are **form-owned**, not populated by a
PostgreSQL trigger. Every upsert submits `trackingMode`, `goal`, and
`goalDuration`; optimistic rows use those submitted values and the server
persists them. The selected-day records drawer may edit per-record goals while
tracking mode remains unchanged by the UI. Deleting and recreating a record
seeds snapshots from the activity's then-current configuration.

For reminders, the boolean toggle sets count to `1` when checked. Unchecking
returns count to `0` and deletes the row when it has no note or other meaningful
content.

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
  → Home Today + Tasks/Reminders calendars + Progress recompute
```

Home does not have a branch in the synchronization hub. Every consumer derives
from the same definitions and month-record caches. Realtime patches those caches
from `HomeActivityRealtime` — not from inside each Today list
([realtime.md](../../../entities/activity/docs/realtime.md)).

---

## Related

| Doc | Why |
| --- | --- |
| [notes-strip.md](./notes-strip.md) | Parallel Home-consumer ownership doctrine |
| [realtime.md](../../../entities/activity/docs/realtime.md) | Live sync mount + gates |
| [ADR 0014](../../../docs/adr/0014-flat-records-client-side-join.md) | Why records stay flat and views join client-side |
| [ADR 0012](../../../docs/adr/0012-calendar-records-always-visible.md) | Why recorded history survives schedule changes |
