# Note edit (write) — Persist + refresh

Part of [Home — Note edit (write)](./README.md).

Skill focus: **API mocking / Integration** — prove an update write lands (or
is correctly sent) and that the Home notes cache/UI reflects the new fields.
Mock network when testing cache sync in isolation; use `mf_testing_*` when
proving server persist. Ownership/`userId` on PATCH is Priority 1.

### Edit — PATCH persists + Home strip reflects

- **What user behavior am I protecting?** After editing a note from Home, the saved title/body (and strip-relevant flags) are stored, and the Home strip card shows the new content without a full reload leaving stale text.
- **What would a regression look like to a user?** Save “succeeds” in the UI but reload shows the old note; or DB updated but Home strip still shows the previous title/body until hard refresh.
- **What is the external boundary?** For cache/UI: mock `fetchPatchNote` (or inject server note). For persist: real `mf_testing_*` DB via service-role / route with test session — mock only auth client wiring as in Priority 1.
- **What must stay real?** `updateNote` / repository PATCH path for persist; `synchronizeNoteCaches` / optimistic Home apply (`applyHomeNoteUpdate`) so strip cards track `previous` → `next`.
- **How will I know I’m done?** Contracts green: (1) update with fixture id → row fields changed in `mf_testing_notes`; (2) `synchronizeNoteCaches({ type: "update", previous, next })` → Home cache strip shows `next`; (3) real `useHomeNotesQuery` + seeded `homeNotesQueryKey` → strip UI shows that cache text (and updates after sync) — not “coverage went up.”

#### Flow — how it happens + where it can break

Forward chain from mutation → DB / Home cache. Write risks:
`⚠︎ failure: … (Should.n)` — tag matches the **Should** row item (same number
as CHEAPEST.n). Use `(Nice)` / `(HIGHEST.n)` when only those cover the step.

[1] useUpdateNoteMutation to optimistic-patch owning caches then call fetcher [@entities/note/hooks/use-update-note-mutation.ts](../../../../entities/note/hooks/use-update-note-mutation.ts)  
⚠︎ failure: success path never reconciles Home; strip stays on previous fields (Should.2)  
↓  
[2] fetchPatchNote to PATCH /api/notes/:id [@entities/note/client/patch-note.ts](../../../../entities/note/client/patch-note.ts)  
↓  
[3] PATCH route to run updateNote for the session user [@app/api/notes/[id]/route.ts](../../../../app/api/notes/[id]/route.ts)  
↓  
[4] updateNote / repository to persist title, content, flags, revision [@entities/note/mutations/update-note.ts](../../../../entities/note/mutations/update-note.ts)  
⚠︎ failure: response looks ok but row unchanged (Should.1)  
↓  
[5] synchronizeNoteCaches (`type: "update"`) to apply Home strip update [@entities/note/cache/synchronize-note-caches.ts](../../../../entities/note/cache/synchronize-note-caches.ts)  
⚠︎ failure: Home cache keeps old title/content after update (Should.2)  
↓  
[6] HomeNotesSection / useHomeNotesQuery to render strips from the TanStack Home cache [@views/home/ui/home-notes-section.tsx](../../../../views/home/ui/home-notes-section.tsx)  
⚠︎ failure: cache has `next` but strip UI still shows previous text (Should.3)

Number CHEAPEST / HIGHEST lists. In table cells, if more than one item, number
them and point at the list: `1. (CHEAPEST.2) **Why:** …` (contract text lives
in the numbered list; the cell carries the why / role).

| | Unit | Integration | E2E |
| --- | --- | --- | --- |
| **Should** | 2. (CHEAPEST.2) **Why:** pure/cache contract — Home cache reflects `next` without network. <br> 3. (CHEAPEST.3) **Why:** proves cache → UI — real query subscription, not a mocked hook. | 1. (CHEAPEST.1) **Why:** proves write actually lands on `mf_testing_*` (or route + DB). | — |
| **Nice** | 1. (CHEAPEST.1 alternate) **Why:** mutation + mocked `fetchPatchNote` asserts request body; weaker than DB assert. | — | 1. (HIGHEST.1) **Why:** edit on Home → reload still shows new text; expensive. |
| **Skip** | **What:** unit tests of fetch wrapper status-code mapping alone ([2]). **Why:** thin HTTP; persist contract is mutation/repo; refresh contracts are cache + cache→UI. <br> **What:** re-testing strip render with mocked `useHomeNotesQuery` (Priority 2 async success). **Why:** that skips the cache subscription; CHEAPEST.3 owns cache→UI. | **What:** re-testing `userId` ownership on PATCH. **Why:** already Priority 1 Edit — update existing note. | — |

**CHEAPEST TEST(s):**
1. Integration — **proves:** row changed in DB (seeded `mf_testing_notes` update; steps [3]–[4]) — [`tests/home/note-edit-write/persist-and-refresh/int/update-note-persists-row.test.ts`](../../../../tests/home/note-edit-write/persist-and-refresh/int/update-note-persists-row.test.ts)
2. Unit — **proves:** Home cache reflected the change (`synchronizeNoteCaches` → `homeNotesQueryKey` shows `next`; step [5]) — [`tests/home/note-edit-write/persist-and-refresh/unit/synchronize-home-cache-on-update.test.ts`](../../../../tests/home/note-edit-write/persist-and-refresh/unit/synchronize-home-cache-on-update.test.ts)
3. Unit (component) — **proves:** Home UI reflected the cache (real `useHomeNotesQuery` + seeded/updated `homeNotesQueryKey` → strip shows new text; step [6]) — [`tests/home/note-edit-write/persist-and-refresh/unit/home-notes-section-cache-to-ui.test.tsx`](../../../../tests/home/note-edit-write/persist-and-refresh/unit/home-notes-section-cache-to-ui.test.tsx)

Together 1–3 = saved → DB **and** cache **and** Home UI. No single CHEAPEST covers all three.

**HIGHEST CONFIDENCE(s):**
1. E2E: Home → edit starred note → save → strip text updates; hard refresh still shows new text ([1]–[6])

---
