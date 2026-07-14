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
6. [architecture/rendering.md](./rendering.md) · [data-flow.md](./data-flow.md) · [routing.md](./routing.md)  
7. Writes / sync: [writes-and-autosave](../entities/note/docs/writes-and-autosave.md), [realtime](../entities/note/docs/realtime.md), [offline](../entities/note/docs/offline.md)  
8. [adr/README.md](./adr/README.md) — decisions (auth, hydrate, selectedDate, hub, …)  
9. File maps: [entities/note/RESPONSIBILITIES.md](../entities/note/RESPONSIBILITIES.md)  

## Index

| Path | Contents |
| ---- | -------- |
| [setup/](./setup/) | Clone and run |
| [architecture/](./architecture/) | Rendering, state, cache, data flow, routing |
| [adr/](./adr/) | Architecture Decision Records |
| [concepts/](./concepts/) | Glossary + terminology |
| [guides/security.md](./guides/security.md) | Auth gates, RLS, IDOR |
| [entities/note/docs/](../entities/note/docs/) | Notes domain WHY |
| [views/notes/docs/](../views/notes/docs/) | Notes page drawer navigation |
| [views/home/docs/](../views/home/docs/) | Home as Notes consumer |
