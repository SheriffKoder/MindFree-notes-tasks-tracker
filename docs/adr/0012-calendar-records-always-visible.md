## ADR 0012: Calendar records are always visible, regardless of schedule

### Status

Accepted

### Context

The Tasks calendar joins two things per day: activity **definitions** (which
carry the current schedule) and **records** (what was actually logged). A
natural first implementation gates every cell by the schedule — "show the task
on a day only if it is scheduled there."

That breaks the moment a user edits frequency. Change a task from *daily* to
*weekly (Mondays)* and a schedule-gated calendar would **erase every past
Tuesday you completed** from view, even though the record rows still exist. The
history looks deleted when only the future cadence changed.

The schedule answers "when is this **due** next" (a forward-looking, Home-Today
concern). It should not decide whether **past facts** render.

### Decision

In `transform/build-calendar-days.ts`, an activity appears on a day when
**either**:

```text
record exists for (taskId, date)   → show, with the record   (history)
else isActiveOnDay(activity, date) → show, empty "due" slot   (schedule)
else                               → skip
```

1. **A recorded day always renders**, schedule-independent — a record is a fact.
2. `isActiveOnDay` (the window + recurrence gate) is used **only** to add
   *empty due slots* for days with no record yet.
3. Editing `scheduleType` / `scheduleConfig` therefore never removes recorded
   history from the calendar; it only changes which empty slots appear going
   forward.
4. Records outside the validity window still render (they happened).

### Why

- **History is immutable in the UI** — editing config is not a destructive act.
- Separates two questions the schedule was overloading: "what happened?"
  (records) vs "what's due?" (schedule).
- Keeps frequency purely about **future visibility** (Home Today, empty slots),
  matching how users reason about it.

Rejected:

- **Gate cells purely by schedule** — hides completed history on any cadence
  change; the reported bug.
- **Snapshot the schedule per record** — heavy, and records already are the
  snapshot of what happened.
- **Filter history in the view instead of the join** — every consumer would
  reimplement the rule; belongs in the shared transform.

### Consequences

Positive:

- Changing frequency is safe and reversible; nothing disappears.
- The join is the single source of "what shows on a day" for calendar + later
  Reminders.

Trade-offs:

- A day can show a task that is no longer scheduled (has a record but fails
  `isActiveOnDay`) — intended, but consumers must not assume "visible ⇒
  scheduled."
- "Hide not-done" style filters live in the **view layer**, not the join, since
  the join deliberately keeps history.

Locked by `transform/build-calendar-days.test.ts` ("keeps recorded days when the
schedule no longer matches").

### Follow-up

- [entities/activity/docs/read-models.md](../../entities/activity/docs/read-models.md)
- [entities/activity/docs/scheduling.md](../../entities/activity/docs/scheduling.md)
