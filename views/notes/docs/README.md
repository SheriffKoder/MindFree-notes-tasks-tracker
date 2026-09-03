# Notes view docs

View-layer documentation for `/notes` — composition and drawer behavior. Domain rules live under `entities/note/docs/`.

| Doc | Status | Topic |
| --- | ------ | ----- |
| [data-flow.md](./data-flow.md) | Current | SSR → caches → views → drawers → write hub |
| [categories.md](./categories.md) | Current | Manage drawer + `?view=category:<id>` |
| [drawer-navigation.md](./drawer-navigation.md) | Current | Selected date, prefetch, page vs drawer |

**ADRs:** [0004](../../../docs/adr/0004-url-owned-application-state.md), [0005](../../../docs/adr/0005-selected-date-not-selected-note.md), [0017](../../../docs/adr/0017-note-categories.md)
