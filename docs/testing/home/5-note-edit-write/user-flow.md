# Note edit (write) — User flow

Part of [Home — Note edit (write)](./README.md).

Skill focus: **User flow** — prove Home can open the shared note drawer on an
existing note and that form changes reach the pre-save orchestrator so an
update is scheduled. Mock the network/mutation at the boundary; keep drawer
open + evaluate → schedule real.

### Edit — open drawer and autosave from Home

- **What user behavior am I protecting?** From a Home strip, the user opens a starred/quick note, edits title/body (or toggles), and an autosave is scheduled — they are not stuck with a silent no-op drawer.
- **What would a regression look like to a user?** Clicking a card does nothing; drawer opens empty / wrong note; typing never triggers save status; or create is fired instead of update for an existing id.
- **What is the external boundary?** Network (`fetchPatchNote` / TanStack mutation) and optional clock/debounce — mock `useUpdateNoteMutation` (or the fetcher); do not mock `openEdit` wiring or `evaluateNoteSave` rules for “existing note → patch.”
- **What must stay real?** `HomeNotesSection` → `openEdit(note.id)`; `useNotesDrawer` request shape; `NoteDrawer` resolving that note; `evaluateNoteSave` choosing update (not create/noop) when the note already exists and values are dirty.
- **How will I know I’m done?** Contracts green: (1) strip click → drawer request is `edit` with that id; (2) dirty form on an existing note → orchestrator schedules `update` (mutation spy called with that note id) — not “coverage went up.”

#### Flow — how it happens + where it can break

Forward chain from Home UI → mutation boundary. Write risks:
`⚠︎ failure: … (Should.n)` — tag matches the **Should** row item (same number
as CHEAPEST.n). Use `(Nice)` / `(HIGHEST.n)` when only those cover the step.

[1] HomeNotesSection to open edit on strip card / quick slot click [@views/home/ui/home-notes-section.tsx](../../../../views/home/ui/home-notes-section.tsx)  
⚠︎ failure: click does not call `openEdit` with the note’s id (Should.1)  
↓  
[2] useNotesDrawer to hold `NoteEditorRequest` (edit id) [@views/notes/model/editor/use-notes-drawer.ts](../../../../views/notes/model/editor/use-notes-drawer.ts)  
↓  
[3] NoteDrawer to resolve the note and mount the form [@features/notes/note-drawer/ui/note-drawer.tsx](../../../../features/notes/note-drawer/ui/note-drawer.tsx)  
⚠︎ failure: drawer opens without the clicked note (Should.1)  
↓  
[4] usePreSaveOrchestrator / evaluateNoteSave to turn dirty form into a scheduled update [@features/notes/note-drawer/pre-save-orchestrator/use-pre-save-orchestrator.ts](../../../../features/notes/note-drawer/pre-save-orchestrator/use-pre-save-orchestrator.ts)  
⚠︎ failure: existing dirty note schedules create/noop instead of update (Should.2)  
↓  
[5] useUpdateNoteMutation to run PATCH (mocked in this group) [@entities/note/hooks/use-update-note-mutation.ts](../../../../entities/note/hooks/use-update-note-mutation.ts)

Number CHEAPEST / HIGHEST lists. In table cells, if more than one item, number
them and point at the list: `1. (CHEAPEST.2) **Why:** …` (contract text lives
in the numbered list; the cell carries the why / role).

| | Unit | Integration | E2E |
| --- | --- | --- | --- |
| **Should** | 1. (CHEAPEST.1) **Why:** cheapest proof Home wires strip click → edit request. <br> 2. (CHEAPEST.2) **Why:** proves dirty existing note chooses `"patch"`, not create/noop. | — | — |
| **Nice** | — | — | 1. (HIGHEST.1) **Why:** full browser: open Home card → type → see saving chrome; expensive vs mocked flow. |
| **Skip** | **What:** unit-testing AppDrawer chrome / NoteForm field widgets alone ([3] form UI). **Why:** this priority cares that Home opens edit and autosave chooses update; field widgets are entity editor concerns. | **What:** live PATCH / DB for open+schedule. **Why:** user-flow practice stops at the mutation boundary; persist + Home refresh live in [persist-and-refresh](./persist-and-refresh.md). | — |

**CHEAPEST TEST(s):**
1. Unit — **proves:** clicking a Home strip card opens that note for edit (steps [1]–[3]) — [`tests/home/note-edit-write/user-flow/unit/home-notes-section-open-edit.test.tsx`](../../../../tests/home/note-edit-write/user-flow/unit/home-notes-section-open-edit.test.tsx)
2. Unit — **proves:** editing an existing note schedules an update (not create) (steps [4]–[5]) — [`tests/home/note-edit-write/user-flow/unit/evaluate-note-save-schedules-patch.test.ts`](../../../../tests/home/note-edit-write/user-flow/unit/evaluate-note-save-schedules-patch.test.ts)

**HIGHEST CONFIDENCE(s):**
1. E2E: Home → open starred note → change title → saving indicator / success; strip text updates (pairs with persist-and-refresh) ([1]–[5])

---
