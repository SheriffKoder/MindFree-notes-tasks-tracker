# Writes and autosave

How Notes decide **what** to write (create / patch / delete / noop) and how that reaches the server and caches.

**Orchestrator WHY:** [ADR 0006](../../../docs/adr/0006-pre-save-orchestrator.md), [feature docs](../../../features/notes/note-drawer/docs/pre-save-orchestrator.md)  
**Pipeline HOW:** [pre-save-orchestrator/README.md](../../../features/notes/note-drawer/pre-save-orchestrator/README.md)  
**Quick slot:** [quick-note.md](./quick-note.md)

---

## Design principles

1. **Lazy create** — empty editor does not insert a row; first meaningful content does.
2. **Autosave** — debounced (~600ms) after form changes; no explicit Save button required.
3. **One interpreter** — `evaluateNoteSave` chooses the action; mutations only apply it.
4. **Cache-first** — optimistic update of read models; server confirms; stale responses gated.
5. **Clean calendar** — clearing a calendar note’s **content** deletes the row (day becomes empty again).

---

## Meaningful content

| Context | “Meaningful” means |
| ------- | ------------------ |
| Calendar-bound (`date` set) | Non-empty **content** (title is usually the formatted date) |
| General / undated | Non-empty **title or content** |

Without meaningful content, lazy create stays `noop`.

---

## Actions

| Action | When |
| ------ | ---- |
| `noop` | Invalid form, not dirty, conflict blocked, or empty draft |
| `create-calendar` | New row, date bound, meaningful content |
| `create-general` | New row, no date, general create context (or quick draft that gained a title) |
| `create-quick` | New row, Home quick create, no title yet |
| `patch` | Existing id, dirty, valid, not auto-delete |
| `delete` | Existing **calendar** note, dirty, content cleared |

**General notes never auto-delete** on empty fields — user uses the trash control.

**Same-day conflict:** another note occupies the target date → banner + save blocked until replace confirmed (or user picks another day / dismisses and edits again).

---

## Path online

```text
form onChange
  → evaluateNoteSave
  → debounce
  → TanStack mutation (create / patch / delete)
       onMutate → synchronizeNoteCaches (optimistic)
       onSuccess → hub again only if server row is newer than cache
       onError → restore snapshots
```

API surfaces (thin routes → entity use-cases):

- `PATCH /api/notes/:id` — field + date moves + `isQuick`
- `POST /api/notes/calendar` — lazy calendar create (`replaceExistingOnDate` optional)
- `POST /api/notes/general` — lazy general create
- `POST /api/notes/home` — lazy quick create
- `DELETE /api/notes/:id` — hard delete

---

## Path offline

If `!isOnline()` when the debounced mutation would run: persist a pending write (user-scoped), patch caches optimistically, mark saved UI. Flush on reconnect via the offline adapter → same `NoteChange` hub.

See [offline.md](./offline.md) and [shared/offline-queue/README.md](../../../shared/offline-queue/README.md).

---

## Date moves

Patching `date` relocates the note between calendar month buckets (and possibly into/out of general). Owner + home membership updates go through `synchronizeNoteCaches` — callers do not hand-roll three `setQueryData`s.

---

## Related

| Doc | Why |
| --- | --- |
| [domain-model.md](./domain-model.md) | Kinds and lifecycle |
| [optimistic-updates.md](./optimistic-updates.md) | Why form must not track every cache write |
| [ADR 0007](../../../docs/adr/0007-synchronize-note-caches-hub.md) | Cache fan-out |
