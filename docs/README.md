# Documentation

Onboarding and architecture for MindFree. Prefer these **WHY** docs over the long step plans under `app/development/workflow/` (those stay as build history / personal reference).

## Cloning the repo?

1. **[setup/0-quick-setup.md](./setup/0-quick-setup.md)** — env, Supabase, migrations  
2. Root **[README.md](../README.md)** — product questions and shipped features  
3. Continue below if you are contributing code  

## Reading order (Notes)

1. [concepts/glossary.md](./concepts/glossary.md) — note kinds and flags  
2. [concepts/terminology.md](./concepts/terminology.md) — folders and layer names  
3. [entities/note/docs/domain-model.md](../entities/note/docs/domain-model.md)  
4. [entities/note/docs/read-models.md](../entities/note/docs/read-models.md)  
5. [architecture/state-management.md](./architecture/state-management.md) · [caching.md](./caching.md)  
6. [architecture/rendering.md](./architecture/rendering.md) · [data-flow.md](./architecture/data-flow.md) · [views/notes/docs/data-flow.md](../views/notes/docs/data-flow.md) · [routing.md](./architecture/routing.md)  
7. Writes / sync: [writes-and-autosave](../entities/note/docs/writes-and-autosave.md), [realtime](../entities/note/docs/realtime.md), [offline](../entities/note/docs/offline.md)  
8. [adr/README.md](./adr/README.md) — decisions (auth, hydrate, selectedDate, hub, …)  
9. File maps: [entities/note/RESPONSIBILITIES.md](../entities/note/RESPONSIBILITIES.md)  

## Reading order (Activity — tasks & reminders)

1. [entities/activity/docs/domain-model.md](../entities/activity/docs/domain-model.md) — one model, two kinds, tracking, records  
2. [entities/activity/docs/scheduling.md](../entities/activity/docs/scheduling.md) — recurrence + window, derived status  
3. [entities/activity/docs/read-models.md](../entities/activity/docs/read-models.md) — caches, calendar join, month progress  
4. [entities/activity/docs/writes-and-autosave.md](../entities/activity/docs/writes-and-autosave.md) — create/patch/archive/delete + cache hub  
5. Decisions: ADR [0011](./adr/0011-one-activity-model-two-kinds.md) · [0012](./adr/0012-calendar-records-always-visible.md) · [0013](./adr/0013-precompute-month-progress-map.md)  
6. File map: [entities/activity/docs/responsibilities.md](../entities/activity/docs/responsibilities.md)  

## Index

| Path | Contents |
| ---- | -------- |
| [setup/](./setup/) | Clone and run |
| [architecture/](./architecture/) | Rendering, state, cache, data flow, routing |
| [adr/](./adr/) | Architecture Decision Records |
| [concepts/](./concepts/) | Glossary + terminology |
| [guides/security.md](./guides/security.md) | Auth gates, RLS, IDOR |
| [entities/note/docs/](../entities/note/docs/) | Notes domain WHY |
| [entities/activity/docs/](../entities/activity/docs/) | Activity (tasks + reminders) domain WHY |
| [views/notes/docs/](../views/notes/docs/) | Notes page data flow and drawer navigation |
| [views/home/docs/](../views/home/docs/) | Home as Notes consumer |
