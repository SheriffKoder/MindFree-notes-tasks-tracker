# Activity calendar cell

How one Tasks calendar day renders its activities — the pill visual, the
completion cue, and where filtering vs. dimming happen.

**Code:** `features/activity/activity-calendar-cell/`
**Where the % comes from:** [entities/activity/docs/read-models.md](../../../../entities/activity/docs/read-models.md)

---

## What the cell receives

`ActivityCalendarCell` is dumb — it renders a `TaskCalendarDay` that upstream
already built and filtered:

| Prop | Meaning |
| ---- | ------- |
| `day` | `{ day, date, activities: { activity, record }[] }` — already filtered |
| `progressByTaskId` | precomputed `Map<taskId, percent>` (ADR 0013) |
| `isSelected` / `isToday` | grid-level day flags |

The join that produces `day.activities` (records always; schedule adds empty due
slots) is [0012-calendar-records-always-visible.md](../../../../docs/adr/0012-calendar-records-always-visible.md).
The percent map is [0013-precompute-month-progress-map.md](../../../../docs/adr/0013-precompute-month-progress-map.md).

---

## Layout: one pill per row

The cell is a single-column grid (`grid-cols-1`) of pills, a day-number badge
pinned bottom-right, and an overflow line:

- Shows up to `maxVisiblePills` (3) pills; the rest collapse into `+N more`.
- Day number sits in a today-circle when `isToday`, muted when the day is empty.
- Limits and colors are tokens in `lib/cell-style-config.ts` — tune theming
  there, not in the components.

---

## The pill

`ActivityTaskPill` paints a task as a color-tinted capsule:

- **Background** — an `absolute inset-0` layer filled with the task color at
  `backgroundOpacity` (0.18). The tint is a separate layer so the text stays
  full-strength.
- **Text** — the title in the task color, truncated; **no leading dot**.
- **Color source** — `activity.color`, falling back to `--color-accent` for
  activities without one (e.g. reminders).

### Completion cue (right side)

```text
completionPercent >= 100  → check icon
otherwise                 → "{percent}%"  (smaller, tabular-nums)
```

The check replaces the percent only at a fully complete month, so a done month
reads as a clean ✓ instead of "100%".

### Done vs not-done

`isDone` = the day's record is `isMeaningfulRecord` for the activity's tracking
mode. It **does not hide** anything — it only dims the pill to
`incompleteOpacity` (0.55). Two distinct concerns:

| Concern | Where |
| ------- | ----- |
| **Dim** an individual not-done pill | this pill (`isDone` → opacity) |
| **Hide** not-done tasks entirely | the calendar **view/filter**, before the join |

Keeping "hide not-done" in the view (not here) is what lets the join stay
history-preserving per ADR 0012 — the cell never decides visibility.

---

## Why it's split this way

- **Cell vs pill** — the cell owns layout/overflow/day-badge; the pill owns one
  task's visual. The pill is `memo`'d and pure (reads props only), so a cheap
  re-render.
- **Style config** — all colors/opacities/limits live in one `*-style-config.ts`
  so theming is data, not scattered class edits.
- **No derivation in UI** — the pill never computes its percent or its "done"
  state from raw records; both arrive as props (ADR 0013).

---

## Related

| Doc | Why |
| --- | --- |
| [read-models.md](../../../../entities/activity/docs/read-models.md) | Calendar join + month progress map |
| [scheduling.md](../../../../entities/activity/docs/scheduling.md) | What "due" (empty slot) means |
| [0012-calendar-records-always-visible.md](../../../../docs/adr/0012-calendar-records-always-visible.md) · [0013-precompute-month-progress-map.md](../../../../docs/adr/0013-precompute-month-progress-map.md) | History-always-visible · precomputed progress |
