# Starred notes (read) — Grouping / mapping

Part of [Home — Starred notes (read)](./README.md).

Skill focus: **Testing functions (grouping/mapping)** — prove strips are built
per `showOnHome` category and that Diary vs non-Diary starred rules put notes
in the right strip. Prefer pure helpers and use-case/repo mapping; mock DB
only when the rule cannot be expressed as a pure function.

### View — build strips by category

- **What user behavior am I protecting?** Each Home category strip shows that category’s quick slot + starred notes; the Diary strip also includes starred calendar notes; non-home categories do not appear as strips.
- **What would a regression look like to a user?** A starred note under the wrong category title, Diary missing calendar-starred notes, a `showOnHome = false` category appearing on Home, or `selectDiaryStrip` picking the wrong default strip for “Add note.”
- **What is the external boundary?** Notes/categories DB (or fixtures) for use-case/repo tests — mock the client/DB at that edge; do not mock the filter/map that builds `{ strips }`.
- **What must stay real?** `getHomeNotesResponse` (only `showOnHome` categories → one strip each); Diary `or(…)` vs other-category `category_id` + `date IS NULL` in `getStarredNotesForHomeStrip`; `selectDiaryStrip` (`isDefault` then first).
- **How will I know I’m done?** Contracts green: (1) `selectDiaryStrip` returns default / first / null as specified; (2) fixture categories+notes → strips only for `showOnHome`, each with the expected note ids; (3) Diary strip includes a starred dated note that non-Diary strips exclude — not “coverage went up.”

#### Flow — how it happens + where it can break

Forward chain from Home UI → data. Display risks: `⚠︎ failure: … (Should.n)` —
tag matches the **Should** row item (same number as CHEAPEST.n). Use `(Nice)` /
`(HIGHEST.n)` when only those cover the step.

[1] HomeNotesSection / strip area to pick a strip by `categoryId` (UI switch) [@views/home/ui/home-notes-section.tsx](../../../../views/home/ui/home-notes-section.tsx)  
↓  
[2] selectDiaryStrip to resolve default category for “Add note” [@views/home/lib/select-diary-strip.ts](../../../../views/home/lib/select-diary-strip.ts)  
⚠︎ failure: wrong strip when default missing or strips empty (Should.1)  
↓  
[3] getHomeNotesResponse to build one strip per showOnHome category [@entities/note/queries/get-home-notes-response.ts](../../../../entities/note/queries/get-home-notes-response.ts)  
⚠︎ failure: non-home categories included, or home categories dropped (Should.2)  
↓  
[4] getStarredNotesForHomeStrip to apply Diary vs other-category starred rules [@entities/note/repository/get-starred-notes-for-home-strip.ts](../../../../entities/note/repository/get-starred-notes-for-home-strip.ts)  
⚠︎ failure: calendar starred missing from Diary, or leaked into another category strip (Should.3)  
↓  
[5] getQuickNote to fill the quick slot for that category [@entities/note/repository/get-quick-note.ts](../../../../entities/note/repository/get-quick-note.ts)

| | Unit | Integration | E2E |
| --- | --- | --- | --- |
| **Should** | 1. (CHEAPEST.1) **Why:** pure helper is cheapest and stable for default-strip selection. | 2. (CHEAPEST.2) **Why:** proves use-case only emits showOnHome strips with expected ids. <br> 3. (CHEAPEST.3) **Why:** proves Diary vs non-Diary starred query rules against fixtures. | — |
| **Nice** | — | — | 1. (HIGHEST.1) **Why:** UI shows note under the category the user starred it into; expensive. |
| **Skip** | **What:** unit-testing the React category switcher for mapping correctness ([1]). **Why:** switching only selects an existing strip by id — mapping ownership is in [2]–[4]. Cover switch labels under [strip-ui](./strip-ui.md). | — | — |

**CHEAPEST TEST(s):**
1. Unit: `selectDiaryStrip` — empty → `null`; default strip preferred; else first strip ([2])
2. Integration (or use-case + mocked repos / `mf_testing_*`): `getHomeNotesResponse(user)` → strip `categoryId`s match only `showOnHome`; each strip’s `starredNotes` / `quickNote` ids match fixtures ([3], [5])
3. Integration: Diary category fixture includes a starred dated note id; a non-default home category’s strip does not ([4])

**HIGHEST CONFIDENCE(s):**
1. E2E: star a calendar note → it appears under Diary on Home; star an undated note in category X → only X’s strip shows it ([1]–[4])

---
