# Architecture Decision Records

Records of significant technical decisions. Each ADR is one decision — context, choice, why, and consequences.

## Index

| ADR | Title | Status |
| --- | ----- | ------ |
| [0001](../ADR/0001-auth-architecture.md) | Supabase Auth architecture | Accepted _(lives in `docs/ADR/` until Phase 5 migrate)_ |
| 0002 | Entity / feature / view structure | Deferred → Phase 5 / `PROJECT-STRUCTURE.md` |
| [0003](./0003-rsc-first-with-query-hydration.md) | RSC-first pages with TanStack hydration | Accepted |
| [0004](./0004-url-owned-application-state.md) | URL-owned application state (`month`, `view`) | Accepted |
| [0005](./0005-selected-date-not-selected-note.md) | Drawer source of truth is selected date | Accepted |
| [0006](./0006-pre-save-orchestrator.md) | Pre-save orchestrator as save interceptor | Accepted |
| [0007](./0007-synchronize-note-caches-hub.md) | `synchronizeNoteCaches` hub | Accepted |
| [0008](./0008-realtime-postgres-changes.md) | Realtime via `postgres_changes` | Accepted |
| [0009](./0009-offline-writes-simple-queue.md) | Simple offline writes queue | Accepted |
| [0010](./0010-one-domain-multiple-consumers.md) | One Notes domain, multiple consumers | Accepted |

## Template

```markdown
## ADR NNNN: Title

### Status
Proposed | Accepted | Superseded

### Context
What problem forced a decision?

### Decision
What we chose (concrete).

### Why
Trade-offs that made this better than alternatives.

### Consequences
Positive, trade-offs, follow-ups.
```

**Related:** [architecture/README.md](../architecture/README.md), [state-management.md](../architecture/state-management.md)
