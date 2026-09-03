# Note entity docs

**WHY** documentation for the Notes domain. For file lookup, use [`../RESPONSIBILITIES.md`](../RESPONSIBILITIES.md). For entry points (`server.ts` / `client.ts`), see [`../README.md`](../README.md).

| Doc | Topic |
| --- | ----- |
| [domain-model.md](./domain-model.md) | What a note is, kinds, `categoryId`, flags, lifecycle |
| [read-models.md](./read-models.md) | Calendar / per-category general / Home strips / categories |
| [writes-and-autosave.md](./writes-and-autosave.md) | PATCH, lazy create, delete rules |
| [quick-note.md](./quick-note.md) | Quick slot per category, graduate / promote |
| [../category/README.md](../category/README.md) | Nested category CRUD, Diary, soft vs hard delete |
| [realtime.md](./realtime.md) | Multi-tab / multi-device cache sync |
| [offline.md](./offline.md) | Offline queue adapter for notes |
| [optimistic-updates.md](./optimistic-updates.md) | Cache vs form sync principles |

**App concepts:** [docs/concepts/glossary.md](../../../docs/concepts/glossary.md)  
**ADRs:** [0006](../../../docs/adr/0006-pre-save-orchestrator.md)–[0010](../../../docs/adr/0010-one-domain-multiple-consumers.md), [0017](../../../docs/adr/0017-note-categories.md)
