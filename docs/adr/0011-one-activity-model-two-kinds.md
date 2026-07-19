## ADR 0011: One activity model, two kinds (tasks + reminders)

### Status

Accepted

### Context

The app needs both **tasks** ("meditate 10 min, daily", with goals, colors, and
calendar completion) and **reminders** ("dentist on the 23rd", no goal, no
progress). Product language treats them as different features on different
pages, which could be read as two entities.

But structurally they are the same row: a titled, scheduled thing with a
validity window that a user records against on given days. Modeling them as two
tables (or two entity folders) would fork:

- The write path (create / patch / archive / delete use-cases)
- The two read caches (definitions + month records)
- The config drawer, form schema, and autosave orchestrator
- Realtime and offline replay (Phases 5–6)

This mirrors the Notes decision (ADR 0010) — one domain, multiple consumers.

### Decision

1. **One model** (`mf_task` / `Activity`) backs both; one `entities/activity`
   folder owns all logic.
2. A **`kind` discriminator** (`"task" | "reminder"`) decides the surface and
   presentation — never a separate type or table.
3. `kind` is **set by the creating page**, never asked in the drawer: the Tasks
   page creates `task`s and the Reminders page creates `reminder`s. The create
   schema takes `kind` from the caller
   (`schema/create-activity.schema.ts`).
4. Definitions are **cached per kind** (`["activities", kind]`), so each surface
   reads its own list without cross-talk.
5. Reminder fields are canonical invariants:
   `trackingMode="boolean"`, `color=null`, `goal=null`, and
   `goalDuration=null`. `normalizeActivityDefinition` enforces them at server
   create/PATCH and optimistic-client write boundaries.
6. Tasks and Reminders mount the same
   `features/activity/activity-page/` composition. Their view and route modules
   are thin wrappers that supply `kind`, copy, and the matching SSR seed.

### Why

- One place to fix write, cache, and sync bugs — reminders inherit tasks'
  correctness for free.
- Matches the data: a reminder is a task with no goal/color and a simpler
  tracking mode, not a different domain.
- New surfaces (Home Today, Progress) become **consumers** that derive from the
  same caches, not new save dialects.

Rejected:

- **`entities/reminder` as a second entity** — split brain; duplicated drawer,
  schema, mutations, sync.
- **A heavy `type` enum with per-type columns** — same forking cost without the
  folder split.
- **Asking `kind` in the drawer** — the surface already knows it; asking invites
  mismatched rows.

### Consequences

Positive:

- `/tasks` and `/reminders` reuse one calendar/list/filter/drawer workflow via
  `ActivityPageClient`; fixes to that workflow apply to both surfaces.
- Reminder definitions cannot retain task-only tracking, color, or goal values,
  even when a client bypasses the hidden form controls.
- Progress/Home read models add without new write paths.

Trade-offs:

- Every query/cache that lists definitions must pass `kind` — forgetting it
  mixes surfaces.
- Shared components must branch on `kind` only where presentation truly differs
  (theme/progress/copy), while keeping data flow and interactions shared.
- Reminder nullability must still be respected by readers even though write
  normalization guarantees canonical persisted values.

### Follow-up

- [entities/activity/docs/domain-model.md](../../entities/activity/docs/domain-model.md)
- [entities/activity/docs/read-models.md](../../entities/activity/docs/read-models.md)
- ADR 0010 — one Notes domain, multiple consumers
