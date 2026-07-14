## ADR 0005: Drawer source of truth is selected date (not selected note)

### Status

Accepted

### Context

Calendar UX needs:

- Tap an empty day → open editor with no existing row
- Swipe / prev-next across days without forcing a new network “get note by id”
- Browse a day in another month while the page calendar stays on the URL month

If the drawer were keyed only by `selectedNoteId`:

- Empty days have nothing to select
- Lazy create becomes awkward (“create stub on open”)
- Day navigation becomes “find next note id” instead of “move one calendar day”

### Decision

1. In **date-nav mode**, the drawer’s primary state is **`activeDate`** (ISO `YYYY-MM-DD`).
2. Resolve the note for that date from TanStack calendar caches (`monthNotes` / day cell) — **no GET-by-id on open** when the month bucket is loaded or prefetched.
3. If no note exists for `activeDate`, show an **empty editor**. Do not insert a DB row until meaningful content exists (lazy create).
4. Drawer day navigation **must not** update page `?month=`, the page calendar highlight, or `MonthNavigator`.
5. **General / quick / edit-by-id** opens use a different editor request (note id or create intent) without day swiping — date-nav is for calendar context only.

### Why

- Matches the product rule: one optional note per day, empty navigation is free
- Keeps page application state (ADR 0004) independent from drawer browsing
- Fits cache-first editing after hydrate (ADR 0003)

Rejected:

- **Stub rows on day open** — pollutes the database and starred/important surfaces
- **Coupling drawer month to URL month** — swiping would thrash the page calendar
- **Always requiring note id** — cannot represent empty days

### Consequences

Positive:

- Prefetch ±1 months at page and drawer boundaries makes day swipe feel local
- Conflict / replace logic can key off target date occupancy in cache

Trade-offs:

- Implementers must remember two modes (date-nav vs note-id)
- Form reset keys must follow date/note context carefully (`resetKey`)
- Cross-month drawer browsing needs cache coverage or a loading gap until prefetch lands

### Follow-up

- [views/notes/docs/drawer-navigation.md](../../views/notes/docs/drawer-navigation.md)
- [docs/architecture/state-management.md](../architecture/state-management.md)
- ADR 0006 — how form changes become create/patch/delete once a date is resolved
