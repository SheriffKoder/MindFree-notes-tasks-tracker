## ADR 0002: Entity / feature / view structure

### Status

Accepted

### Context

The app mixes route composition, product workflows (drawer), and domain persistence. Flattening everything under `components/` or splitting too early by “calendar vs home” folders duplicates logic and blurs ownership.

### Decision

1. Organize by **responsibility-first FSD-style layers**: `app/` → `views/` → `features/` → `entities/` → `shared/`.
2. **Split by layer by default**; split by subarea only when that subtree has zero external dependents (`PROJECT-STRUCTURE.md`).
3. Each domain entity exposes **`server.ts` / `client.ts` / `index.ts`** entry points so client bundles do not pull repositories.
4. Shared infra (`react-query`, `offline-queue`, auth helpers) stays domain-agnostic; domain cache keys live in the entity.

### Why

- Clear dependency direction (features import entities; entities never import views)
- Matches how Notes actually shipped (entity + drawer feature + page view)
- Gives a checklist for Tasks and later domains

### Consequences

Positive: onboarding maps to folders; AI/tools can navigate via READMEs and `RESPONSIBILITIES.md`.  
Trade-off: contributors must learn the vocabulary ([terminology](../concepts/terminology.md)).

### Follow-up

- `app/development/guidelines/PROJECT-STRUCTURE.md`
- [data-flow.md](../architecture/data-flow.md)
