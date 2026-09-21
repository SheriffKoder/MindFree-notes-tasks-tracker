# Starred notes (read) — Strip UI

Part of [Home — Starred notes (read)](./README.md).

Skill focus: **Testing components (isolated + props)** — pass fixture strips into
dumb UI; assert cards, empty shell, and category labels. No network.

### View — render strip / empty / switch

- **What user behavior am I protecting?** For a selected home category, the user sees the quick slot plus starred note cards (and can switch category titles); with no strips, they see the empty-categories panel — not a broken carousel.
- **What would a regression look like to a user?** Starred titles missing from the carousel while props include them; quick placeholder gone when `quickNote` is null; wrong category name selected; empty message missing when `strips` is empty.
- **What is the external boundary?** None for these components — they take props. Parent async/query is covered in [async-section](./async-section.md).
- **What must stay real?** `HomeNotesStrip` mapping `quickNote` + `starredNotes` → cards; empty branch in strip area; `HomeNotesStripHeader` labels / `aria-current` for the selected category.
- **How will I know I’m done?** Contracts green: (1) fixture strip → quick + each starred title (or accessible name) present; (2) `quickNote: null` → “Create quick note…” placeholder; (3) empty strips → empty panel copy; (4) header shows all category names and marks the selected one — not “coverage went up.”

#### Flow — how it happens + where it can break

Forward chain from Home UI → data. Display risks: `⚠︎ failure: … (Should.n)` —
tag matches the **Should** row item (same number as CHEAPEST.n). Use `(Nice)` /
`(HIGHEST.n)` when only those cover the step.

[1] HomeNotesStripArea to choose empty panel vs strip + header [@views/home/ui/home-notes-section.tsx](../../../../views/home/ui/home-notes-section.tsx)  
⚠︎ failure: empty strips still render a strip shell, or strips present still show empty copy (Should.3)  
↓  
[2] HomeNotesStripHeader to list category names and mark selection [@views/home/ui/home-notes-strip-header.tsx](../../../../views/home/ui/home-notes-strip-header.tsx)  
⚠︎ failure: wrong/missing category labels or selected state (Should.4)  
↓  
[3] HomeNotesStrip to render quick slot + starred cards for one strip [@views/home/ui/home-notes-strip.tsx](../../../../views/home/ui/home-notes-strip.tsx)  
⚠︎ failure: starred notes in props not shown, or quick placeholder missing when null (Should.1–2)  
↓  
[4] NoteListCard to present one note (dumb card) [@features/notes/note-list-card](../../../../features/notes/note-list-card)

| | Unit | Integration | E2E |
| --- | --- | --- | --- |
| **Should** | 1. (CHEAPEST.1) **Why:** cheapest proof carousel reflects `starredNotes` props. <br> 2. (CHEAPEST.2) **Why:** proves null quick slot UX. <br> 3. (CHEAPEST.3) **Why:** proves empty-categories panel. <br> 4. (CHEAPEST.4) **Why:** proves category switcher labels / selected state from props. | — | — |
| **Nice** | **What:** two-row layout split when `isTwoRows` + enough cards. **Why:** layout nicety; less product-critical than missing notes. | — | 1. (HIGHEST.1) **Why:** real Home carousel + category tap; expensive vs props tests. |
| **Skip** | **What:** deep unit tests of `NoteListCard` styling / reserved meta ([4]) for this priority. **Why:** card is shared; Home risk is whether the strip passes notes through. Test card once elsewhere if needed. | **What:** DB-backed strip rendering. **Why:** props fixtures are enough; grouping/DB is [grouping](./grouping.md). | — |

**CHEAPEST TEST(s):**
1. Unit (component): `HomeNotesStrip` with fixture `starredNotes` → each note title (or role/name) visible ([3])
2. Unit (component): `HomeNotesStrip` with `quickNote: null` → quick placeholder control present ([3])
3. Unit (component): strip area / section with `strips: []` → “No note categories on Home.” ([1])
4. Unit (component): `HomeNotesStripHeader` with multiple strips → all names; selected has `aria-current` ([2])

**HIGHEST CONFIDENCE(s):**
1. E2E: on Home, switch category tabs → carousel content matches that strip; empty account shows empty copy ([1]–[3])

---
