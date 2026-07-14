## ADR 0010: One Notes domain, multiple consumers (Home + Notes)

### Status

Accepted

### Context

Home needs a quick-capture slot and a starred carousel. Early product language could be read as “Home notes” vs “Notes page notes.” Implementing that as a second entity (or Home-owned save/sync) would duplicate:

- Autosave / date-general / quick rules
- Optimistic cache updates
- Realtime and offline replay

We already had three **read models** on one table. Home is another presentation of the same rows, not a new domain.

### Decision

1. **Notes remains the only notes domain** — one table, one entity folder, one drawer + orchestrator.
2. **Home is a consumer**: read `["homeNotes"]`, render strip UI, open shared drawer. No Home-specific mutation/realtime/offline stack.
3. Allow a dedicated **read model** (`GET /api/notes/home`, `HomeNotesResponse`) — different shape, same domain.
4. Keep **all write and sync fan-out** in the entity (`synchronizeNoteCaches` and adapters). Home benefits automatically.
5. Prefer **extending** shared UI (`NoteListCard`, `useNotesDrawer`, reserved-meta) over copying.

### Why

- One place to fix save bugs (ADR 0006) and cache membership (ADR 0007)
- Realtime/offline are domain capabilities (ADRs 0008–0009), not per-page features
- Matches the product: starred/quick are flags/roles on notes, not separate products

Rejected:

- **`entities/home-note` or Home-only API write routes** — split brain
- **Embedding full calendar month payloads on Home** — wrong question for the strip
- **Building the sync hub before Home shipped** — premature; hub earned after duplicate patches (Notes strip plan Phase A → B)

### Consequences

Positive:

- Star on Notes updates Home strip without Home knowing PATCH details
- New surfaces (e.g. progress widgets later) can add read models without new save dialects

Trade-offs:

- Home contributors must learn the note entity entry points (`client.ts` / docs)
- `homeNotes` must stay in the hub’s membership rules or Home drifts again
- Temptation to “just patch home cache in the view” must be refused

### Follow-up

- [views/home/docs/notes-strip.md](../../views/home/docs/notes-strip.md)
- [entities/note/docs/quick-note.md](../../entities/note/docs/quick-note.md)
- [entities/note/docs/read-models.md](../../entities/note/docs/read-models.md)
