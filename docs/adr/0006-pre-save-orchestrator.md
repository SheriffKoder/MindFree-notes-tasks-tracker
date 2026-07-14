## ADR 0006: Pre-save orchestrator as save interceptor

### Status

Accepted

### Context

Saving a note is not “PATCH whatever the form holds.” Rules include:

- Resolve calendar date from picker intent, formatted title, or opening context
- Normalize calendar titles to the date format when date-bound
- Lazy create vs patch vs delete empty calendar content
- One-note-per-day conflict / replace confirmation
- Quick-slot graduate / promote invariants
- Debounced autosave + offline when disconnected

Scattering those rules across form inputs, mutation hooks, and API routes made early drafts hard to reason about and easy to desync (Home vs Notes, calendar vs general).

### Decision

1. Keep **`NoteForm` / `useNoteForm` dumb** — local fields, dirty/valid meta, calendar title prefill on context reset. No network, no conflict UI.
2. Put interpretation in a **pre-save orchestrator**:
   - Pure pipeline: `evaluateNoteSave` (resolve → normalize → gates → action)
   - Thin hook: `usePreSaveOrchestrator` (refs, debounce, TanStack mutate / offline pending)
3. Treat the orchestrator as the **only interceptor** between form `onChange` and mutations — drawer wiring stays thin.
4. Entity mutations / API routes **apply** an already-decided payload (patch/create/delete); they do not re-interpret picker title heuristics.

### Why

- One place to read when autosave misbehaves
- Pure `evaluateNoteSave` is testable without React
- Form remains reusable; Home and Notes share the same drawer + orchestrator
- Avoids touching many files for each new save rule (date-general cycle, quick slot, conflict)

Rejected:

- **Smart form** that calls mutations per field — couples UI to every rule
- **Fat mutation `onMutate`** that guesses intent from partial payloads — hard to test, duplicates resolveDate
- **Many one-off handlers** in the drawer component — grows into an unmaintainable island

### Consequences

Positive:

- Clear ownership table: form vs orchestrator vs entity write
- Conflict banner and date-nav enablement come from the same evaluation result
- Offline path can reuse the same pending mutation kinds the orchestrator already chose

Trade-offs:

- New contributors must find `evaluate-note-save.ts` — it is not in `entities/note`
- Orchestrator `handleChange` identity must stay stable when `note` cache references change (pending hardening)
- Deep pipeline docs live in feature README + Phase 3 `pre-save-orchestrator.md`

### Follow-up

- [features/notes/note-drawer/pre-save-orchestrator/README.md](../../features/notes/note-drawer/pre-save-orchestrator/README.md)
- Phase 3: `features/notes/note-drawer/docs/pre-save-orchestrator.md` (WHY summary)
- [docs/concepts/glossary.md](../concepts/glossary.md) — lazy create, conflict, graduate/promote
