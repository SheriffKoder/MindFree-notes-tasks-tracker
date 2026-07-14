## ADR 0004: URL-owned application state (`month`, `view`)

### Status

Accepted

### Context

The Notes page has application chrome that is not ephemeral UI:

- Which month the calendar and month-notes list show
- Which presentation is active (calendar grid, month cards, general list)

Putting that only in React state loses bookmarking, refresh, and browser back. Putting it only on the server (`searchParams` in an async page) makes every toggle a server round-trip and Suspense flash — bad for a month navigator users click often.

### Decision

1. Own **month** and **view** in the URL search string:

   ```text
   /notes?month=YYYY-MM&view=calendar|month-notes|general-notes
   ```

2. Read and write them from a **client** hook (`useNotesUrlState`) via `useSearchParams` / router navigation.
3. Keep the **route page sync** — do not make the Server Component wait on `searchParams` for the Notes shell.
4. Bind TanStack `["calendarNotes", month]` to the URL month on the client; general notes stay on `["generalNotes"]` (month-independent).
5. Do **not** put drawer open state, selected day inside the drawer, or form drafts in the URL.

### Why

- Bookmarkable and shareable “July calendar” links
- Back/forward matches user expectation for view switches
- Decouples application navigation from drawer date browsing (see ADR 0005)

Rejected:

- **React state only** — refresh snaps to defaults
- **Server-driven `searchParams` on every change** — slower, remounts more of the tree
- **Encoding selected note id in the URL for every open** — couples list selection to deep links we did not need for v1; empty days have no id

### Consequences

Positive:

- Month navigator and view switcher are simple URL writers
- Prefetch of adjacent months aligns with the URL month without inventing a second “display month”

Trade-offs:

- Client must default/normalize invalid `month` / `view` values
- SSR hydrate may seed “today’s month” while the URL might say another month — client fetch fills the gap (documented in Notes plan)

### Follow-up

- [docs/architecture/state-management.md](../architecture/state-management.md)
- [views/notes/docs/drawer-navigation.md](../../views/notes/docs/drawer-navigation.md) — drawer must not rewrite page month
