# Home notes strip

Why Home shows a horizontal **quick note + starred notes** row — and what Home must **not** own.

**Decision:** [ADR 0010](../../../docs/adr/0010-one-domain-multiple-consumers.md)  
**Quick rules:** [entities/note/docs/quick-note.md](../../../entities/note/docs/quick-note.md)  
**Read model:** [entities/note/docs/read-models.md](../../../entities/note/docs/read-models.md)  
**Workflow archive:** `app/development/workflow/home/notes-strip.md`

---

## What you see

```text
Home "Starred Notes"
  └─ drag / overflow row
       ├─ [quick card]      isQuick — always first (or empty placeholder)
       └─ [starred cards]   starred && !isQuick — recent first
```

Tap opens the **same** `NoteDrawer` used on `/notes` (edit / create-quick). Autosave, offline, realtime, and conflict rules are not reimplemented on Home.

---

## Home's job

| Owns | Does not own |
| ---- | ------------ |
| Layout: strip, drag scroll, aside shell | Note domain mutations |
| Mount `useHomeNotesQuery` + hydrate seed | A second save orchestrator |
| Open drawer via shared `useNotesDrawer` | Home-only PATCH / realtime forks |
| Mount `useOfflineSync` / realtime so strip stays live | Private cache keys for “home notes” writes |

`GET /api/notes/home` → `["homeNotes"]` is a **read model** over the same `mf_notes` rows — different shape, same entity.

---

## Consistency

When a note is starred, unstarred, deleted, graduated from quick, or edited on `/notes` or another device:

1. Source (mutation / realtime / offline flush) → `NoteChange`
2. `synchronizeNoteCaches` updates calendar/general **and** `homeNotes`

Home does not invent a parallel sync pipeline. See [ADR 0007](../../../docs/adr/0007-synchronize-note-caches-hub.md).

---

## UI reuse

- Cards: `NoteListCard` (`variant="home"`)
- Labels: shared reserved-meta (date vs title) — not Home-copied copy helpers
- Editor: `features/notes/note-drawer` + pre-save orchestrator

---

## Related

| Doc | Why |
| --- | --- |
| [entities/note/docs/offline.md](../../../entities/note/docs/offline.md) | Offline mount on Home client island |
| [entities/note/docs/realtime.md](../../../entities/note/docs/realtime.md) | Live updates without refresh |
| [views/notes/docs/drawer-navigation.md](../../notes/docs/drawer-navigation.md) | Shared drawer behavior |
