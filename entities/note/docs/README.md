# Note entity docs

**WHY** documentation for the Notes domain. For file lookup, use [`../RESPONSIBILITIES.md`](../RESPONSIBILITIES.md). For entry points (`server.ts` / `client.ts`), see [`../README.md`](../README.md).

| Doc | Topic |
| --- | ----- |
| [domain-model.md](./domain-model.md) | What a note is, kinds, flags, lifecycle |
| [read-models.md](./read-models.md) | Calendar / general / home APIs and caches |
| [writes-and-autosave.md](./writes-and-autosave.md) | PATCH, lazy create, delete rules |
| [quick-note.md](./quick-note.md) | Quick slot, graduate / promote |
| [realtime.md](./realtime.md) | Multi-tab / multi-device cache sync |
| [offline.md](./offline.md) | Offline queue adapter for notes |
| [optimistic-updates.md](./optimistic-updates.md) | Cache vs form sync principles |

**App concepts:** [docs/concepts/glossary.md](../../../docs/concepts/glossary.md)  
**ADRs:** [0006](../../../docs/adr/0006-pre-save-orchestrator.md)–[0009](../../../docs/adr/0009-offline-writes-simple-queue.md)
