# Payment entity docs

**WHY** documentation for the Payments domain. For file lookup, use
[`./responsibilities.md`](./responsibilities.md). For entry points
(`server.ts` / `client.ts` / `editor/`), see [`../README.md`](../README.md).

| Doc | Topic |
| --- | ----- |
| [domain-model.md](./domain-model.md) | Fields, amount storage, unconstrained `group` + UI config |
| [read-models.md](./read-models.md) | Month key, `PaymentsMonthResponse`, no Home list cache |
| [writes-and-autosave.md](./writes-and-autosave.md) | Lazy create, debounced patch, immediate delete |
| [realtime.md](./realtime.md) | Multi-tab / multi-device cache sync (`postgres_changes`) |
| [offline.md](./offline.md) | Offline queue; flush on reconnect (ADR 0009) |
| [responsibilities.md](./responsibilities.md) | File map + quick lookup |

**Shared offline HOW:** [shared/offline-queue/README.md](../../../shared/offline-queue/README.md)  
**ADRs:** [0008](../../../docs/adr/0008-realtime-postgres-changes.md),
[0009](../../../docs/adr/0009-offline-writes-simple-queue.md)
