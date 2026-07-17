# Activity entity docs

**WHY** documentation for the Activity domain (tasks + reminders). For file
lookup, use [`./responsibilities.md`](./responsibilities.md). For entry points
(`server.ts` / `client.ts` / `editor/`), see [`../README.md`](../README.md).

| Doc | Topic |
| --- | ----- |
| [domain-model.md](./domain-model.md) | One model, two kinds; tracking modes; records; lifecycle |
| [scheduling.md](./scheduling.md) | Recurrence + validity window (one gate); derived status |
| [read-models.md](./read-models.md) | Definitions vs records caches; calendar join; month progress |
| [writes-and-autosave.md](./writes-and-autosave.md) | Create/patch/archive/delete; autosave; cache hub |
| [responsibilities.md](./responsibilities.md) | File map + quick lookup |

**App concepts:** [docs/concepts/terminology.md](../../../docs/concepts/terminology.md) (folder + layer names)
