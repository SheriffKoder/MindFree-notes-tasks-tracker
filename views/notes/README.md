# Notes page (`views/notes`)

Page composition for `/notes` — calendar, month list, per-category undated lists, manage-categories drawer, and wiring into the shared note drawer.

**Domain WHY:** [entities/note/docs/](../../entities/note/docs/README.md)  
**State / cache:** [docs/architecture/state-management.md](../../docs/architecture/state-management.md), [caching.md](../../docs/architecture/caching.md)

| Doc | Topic |
| --- | ----- |
| [docs/data-flow.md](./docs/data-flow.md) | SSR → caches → views → drawers → write hub |
| [docs/categories.md](./docs/categories.md) | Dynamic `category:<id>` views and manage drawer |
| [docs/drawer-navigation.md](./docs/drawer-navigation.md) | Drawer date nav, prefetch, independence from URL month |
