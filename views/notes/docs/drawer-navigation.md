# Drawer navigation (Notes page)

How the note drawer relates to the Notes page calendar — and why they stay independent.

**Decision:** [ADR 0005](../../../docs/adr/0005-selected-date-not-selected-note.md)  
**URL month/view:** [ADR 0004](../../../docs/adr/0004-url-owned-application-state.md)  
**Implementation:** `features/notes/note-drawer/`, `views/notes/model/editor/`

---

## Two navigators

| Navigator | Owns | Updates |
| --------- | ---- | ------- |
| **Page** `MonthNavigator` | Visible month for calendar / month-notes | URL `?month=` |
| **Drawer** date controls | Day being edited (swipe / prev / next) | Drawer `activeDate` only |

Swiping days in the drawer must **not** change the page calendar, URL month, or month switcher. A user can look at July on the page while editing a March day in the drawer.

---

## Source of truth: `activeDate`

In calendar / date-nav mode:

1. Primary state is an ISO date (`YYYY-MM-DD`), not a sticky note id.
2. The note for that day is **resolved from TanStack** (`["calendarNotes", monthOf(date)]`) via `useResolvedDrawerNote`.
3. Missing row → empty editor (lazy create on first meaningful content).
4. No per-open `GET /notes/:id` when the month cache already has (or will prefetch) that day.

General list / quick / explicit edit opens use a **note-id or create request** without day swiping — different editor mode, same drawer shell.

---

## Prefetch

Warm month buckets so day edges feel local:

| Where | When | What |
| ----- | ---- | ---- |
| Page (`notes-views-section`) | Active month query succeeds | Prefetch ±1 months |
| Drawer | `activeDate` near month boundary | Prefetch neighbor months if cold |

Both reuse entity helpers (`prefetchAdjacentCalendarMonths` / month prefetch). Keys stay `["calendarNotes", month]`.

---

## Responsibility split

| Layer | Role |
| ----- | ---- |
| Server hydrate | Seed current month (+ general); optional non-blocking seed |
| Page client | Render views from cache; open drawer with initial date or note request |
| Drawer client | Date nav, resolve note, form, orchestrator, mutations, month prefetch |

After hydrate, the drawer is a **cache client**, not a second data plane.

---

## Why this shape

- Empty days are first-class without stub rows (ADR 0005).
- Page application state stays bookmarkable (ADR 0004) while drawer browsing stays free.
- Autosave and conflict checks can ask “who occupies this date?” from cache without refetching the page.

---

## Related

| Doc | Why |
| --- | --- |
| [state-management.md](../../../docs/architecture/state-management.md) | Three state buckets |
| [read-models.md](../../../entities/note/docs/read-models.md) | Calendar month payload |
| [ADR 0006](../../../docs/adr/0006-pre-save-orchestrator.md) | Form → save action once date is resolved |
| Workflow archive | `02-notes-page.md` — Drawer Navigation Decisions |
