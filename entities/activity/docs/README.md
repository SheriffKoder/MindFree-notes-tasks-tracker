# Activity entity docs

**WHY** documentation for the Activity domain (tasks + reminders). For file
lookup, use [`./responsibilities.md`](./responsibilities.md). For entry points
(`server.ts` / `client.ts` / `editor/`), see [`../README.md`](../README.md).

| Doc | Topic |
| --- | ----- |
| [domain-model.md](./domain-model.md) | One model, two kinds; tracking modes; records; lifecycle |
| [scheduling.md](./scheduling.md) | Recurrence + validity window (one gate); derived status |
| [read-models.md](./read-models.md) | Definitions vs records caches; calendar/Home joins |
| [progress.md](./progress.md) | Progress report: due-day Option B **and** period-goal path |
| [writes-and-autosave.md](./writes-and-autosave.md) | Definition autosave; daily record writes; cache hub |
| [realtime.md](./realtime.md) | Multi-tab / multi-device cache sync (`postgres_changes`) |
| [responsibilities.md](./responsibilities.md) | File map + quick lookup |

**App concepts:** [docs/concepts/terminology.md](../../../docs/concepts/terminology.md) (folder + layer names)
