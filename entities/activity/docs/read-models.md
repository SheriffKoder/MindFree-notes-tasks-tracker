# Activity read models

Why Activity keeps **two** caches — stable definitions and month-scoped records
— and how the client joins them into calendar and progress views.

**Types:** `entities/activity/model/read-models.ts`
**Keys:** `entities/activity/client/query-keys.ts`

---

## Two caches, two lifetimes

| Cache | Question | Scope | Key |
| ----- | -------- | ----- | --- |
| Definitions | What activities exist for this kind? | all time, per `kind` | `["activities", kind]` |
| Records | What was recorded this month? | one `YYYY-MM` | `["activityRecords", month]` |

Definitions are **stable** — they don't change when you page through months, so
they're keyed by `kind` and fetched once. Records are **month-scoped**, so month
navigation refetches records only and leaves definitions cached. This split is
the whole reason the two aren't one payload: paging months must not re-download
every definition.

```text
GET /api/activities?kind=task        → ActivitiesResponse    key ["activities","task"]
GET /api/activity-records?month=YYYY-MM → ActivityRecordsResponse key ["activityRecords", month]
```

Records travel **flat** over the wire (a day holds records for many activities);
`buildActivityRecordsResponse` only sorts them by `(date, taskId)` for stable
rendering. Lookup maps are derived client-side, not shipped — why we don't
aggregate on the server (unlike Notes):
[0014-flat-records-client-side-join.md](../../../docs/adr/0014-flat-records-client-side-join.md).

---

## Record lookup (derived client-side)

`lib/record/build-record-lookup.ts` turns the flat month into two maps in a
single pass:

| Map | Key → value | Used by |
| --- | ----------- | ------- |
| `byTaskDate` | `${taskId}:${date}` → record | calendar/Home cells, recording |
| `byTaskId` | `taskId` → record[] | per-task metadata, progress |

The natural key `${taskId}:${date}` (`recordKey`) addresses a record without its
row id — the same `(taskId, date)` aggregate identity from
[domain-model.md](./domain-model.md).

---

## Calendar-day join

`transform/build-calendar-days.ts` joins definitions + the record lookup into
one `TaskCalendarDay` per day: `{ day, date, activities: { activity, record }[] }`.

An activity lands on a day when **either**:

- it has a **record** for that date — history, schedule-independent; **or**
- it is **currently scheduled** there (`isActiveOnDay`) — an empty *due* slot.

```text
record exists?        → show (with record)      // history always wins
else isActiveOnDay?   → show (empty due slot)
else                  → skip
```

This is the deliberate rule behind [0012-calendar-records-always-visible.md](../../../docs/adr/0012-calendar-records-always-visible.md): **changing a task's frequency never
hides days you already recorded.** The schedule only governs where *empty* slots
appear. Visibility filtering (e.g. "hide not-done") stays in the view layer, not
here.

---

## Month progress map

A task can appear on many calendar days; computing its completion % inside each
pill would repeat the same scan. `transform/compute-task-month-progress.ts` does
it **once per month**:

```text
computeTaskMonthProgress(month, activities, lookup) → Map<taskId, percent>
percent = round(completedActiveDays / scheduledActiveDays * 100)
```

- Denominator = days where `isActiveOnDay` (scheduled).
- Numerator = those days whose record is `isMeaningfulRecord` for the mode.
- No scheduled days → `0`.

The calendar pane computes this map once and each pill reads its value by
`taskId` — the reason it's a map, not a per-cell derivation ([0013-precompute-month-progress-map.md](../../../docs/adr/0013-precompute-month-progress-map.md)). Same map
will feed the Progress page later.

---

## SSR hydration

| Page | Seed |
| ---- | ---- |
| `/tasks` | definitions + current-month records → `seedActivityCaches` |
| `/` (Home) | same two caches → `seedActivityCaches` (composed into one Home seed) |

`queries/get-tasks-page-initial-data.ts` fetches both payloads in parallel on
the server; `hydration/seed-activity-caches.ts` writes them into the two canonical
keys (the seed component dehydrates once for the client boundary), so first
paint doesn't wait for a client round-trip. The Home seed composes the same
writer alongside other entities. After hydration every island shares one browser
`QueryClient`.

---

## Home Today join

`hooks/use-home-today-query.ts` is a memoized selector over task definitions and
the current month's records. It builds the record lookup once, then calls
`lib/today/build-today-activities.ts` for today's `YYYY-MM-DD`.

An unarchived task appears when **either**:

- today's record exists — history remains visible after schedule edits; or
- `isActiveOnDay(activity, today)` — an empty task is due today.

Each `TodayActivity` carries `{ activity, record, done, progress }`.
`lib/record/derive-today-progress.ts` returns per-dimension progress:

| Mode | `progress.dimensions` |
| ---- | --------------------- |
| `boolean` / `count` | one `Count` dimension (`goal`) |
| `duration` | one `Minutes` dimension (`goalDuration`) |
| `count+duration` | both, independently |

Each dimension has `value`, `goal`, `remaining`, and `percent` (`null` when
unbounded). `done` is true when every **configured** dimension reaches its
goal, or — if no goals are set — when the record is meaningful.

Home presentation stays dumb: stacked `value/goal` labels (with `Count` /
`Minutes` prefixes only for `count+duration`), and one donut that averages
bounded percents. Domain math stays in the entity; the card does not invent a
second completion rule.

There is no `homeActivities` query key. A record upsert/delete changes the
current `activityRecords` month bucket, and the selector recomputes
automatically. See
[views/home/docs/today-list.md](../../../views/home/docs/today-list.md).

---

## Home & Progress derive, they don't fork

There is no separate "Home activities" or "Progress" cache. Home Today and the
Progress page both derive from the **same two caches** (`activities` +
`activityRecords`). That's why the write hub (`synchronizeActivityCaches`) has no
Home branch — updating the shared caches updates every consumer at once. See
[writes-and-autosave.md](./writes-and-autosave.md).

---

## Related

| Doc | Why |
| --- | --- |
| [domain-model.md](./domain-model.md) | Records as `(taskId, date)` aggregates |
| [scheduling.md](./scheduling.md) | `isActiveOnDay` behind the join denominator |
| [writes-and-autosave.md](./writes-and-autosave.md) | Keeping both caches consistent |
| [views/home/docs/today-list.md](../../../views/home/docs/today-list.md) | Home's layout, query mount, and inline-recording boundary |
| [views/tasks/docs/data-flow.md](../../../views/tasks/docs/data-flow.md) | Server fetch → caches → calendar/list endpoints |
| [0012-calendar-records-always-visible.md](../../../docs/adr/0012-calendar-records-always-visible.md) · [0013-precompute-month-progress-map.md](../../../docs/adr/0013-precompute-month-progress-map.md) | History-always-visible · precomputed progress map |
| [0014-flat-records-client-side-join.md](../../../docs/adr/0014-flat-records-client-side-join.md) | Why records ship flat + join on the client (vs. Notes) |
