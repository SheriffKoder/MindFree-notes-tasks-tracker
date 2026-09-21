# Starred notes (read) — Async section

Part of [Home — Starred notes (read)](./README.md).

Skill focus: **Async sections (mock only)** — mock the home-notes query;
assert loading / error / empty / success UI. Do not hit the real API or DB.

### View — load home strips

- **What user behavior am I protecting?** Opening Home, the starred-notes area shows a clear loading state, then either category strips, an empty-categories message, or a visible error — never a blank / stuck shell.
- **What would a regression look like to a user?** Forever “Loading notes…”, a silent blank row when categories exist, or a successful strip UI while the query failed (or the reverse: error chrome when data is already cached).
- **What is the external boundary?** TanStack Query / `fetchHomeNotes` (network) — mock `useHomeNotesQuery` (and categories when needed); do not mock the section’s branching on `isPending` / `isError` / `strips`.
- **What must stay real?** `HomeNotesSection` decisions: pending+no data → loading panel; error → error panel; `strips.length === 0` → empty message; otherwise render strip area.
- **How will I know I’m done?** Contracts green: (1) pending with no cache → “Loading notes…”; (2) `isError` → error message; (3) empty `strips` → “No note categories on Home.”; (4) fixture strips → category header + strip cards appear — not “coverage went up.”

#### Flow — how it happens + where it can break

Forward chain from Home UI → data. Display risks: `⚠︎ failure: … (Should.n)` —
tag matches the **Should** row item (same number as CHEAPEST.n). Use `(Nice)` /
`(HIGHEST.n)` when only those cover the step.

[1] HomeNotesSection to branch on query status and render panels / strip area [@views/home/ui/home-notes-section.tsx](../../../../views/home/ui/home-notes-section.tsx)  
⚠︎ failure: wrong panel for pending / error / empty / success (Should.1–4)  
↓  
[2] useHomeNotesQuery to read strips from the TanStack cache [@entities/note/hooks/use-home-notes-query.ts](../../../../entities/note/hooks/use-home-notes-query.ts)  
↓  
[3] fetchHomeNotes to GET /api/notes/home (mocked away in these tests) [@entities/note/client/home-notes-query.ts](../../../../entities/note/client/home-notes-query.ts)

| | Unit | Integration | E2E |
| --- | --- | --- | --- |
| **Should** | 1. (CHEAPEST.1) **Why:** cheapest proof of pending UI with mocked query. <br> 2. (CHEAPEST.2) **Why:** proves error path is visible. <br> 3. (CHEAPEST.3) **Why:** proves empty-categories copy. <br> 4. (CHEAPEST.4) **Why:** proves success path mounts strip UI from fixture props/cache. | — | — |
| **Nice** | — | — | 1. (HIGHEST.1) **Why:** full browser load of Home notes section; expensive vs mocked async. |
| **Skip** | **What:** unit tests of `fetchHomeNotes` / `homeNotesQueryOptions` ([3]). **Why:** those only forward HTTP; display contracts live in the section’s status branching. Real fetch + DB ownership is Priority 1. | **What:** live `GET /api/notes/home` for this flow. **Why:** async-section practice is mock-only; integration for strips belongs under isolation / grouping. | — |

**CHEAPEST TEST(s):**
1. Unit (async mock): `useHomeNotesQuery` → `{ isPending: true, data: undefined }` → “Loading notes…” ([1]–[2]) — [`tests/home/starred-notes-read/async-section/unit/home-notes-section-loading.test.tsx`](../../../../tests/home/starred-notes-read/async-section/unit/home-notes-section-loading.test.tsx)
2. Unit (async mock): `useHomeNotesQuery` → `{ isError: true, error }` → error panel message ([1]–[2]) — [`tests/home/starred-notes-read/async-section/unit/home-notes-section-error.test.tsx`](../../../../tests/home/starred-notes-read/async-section/unit/home-notes-section-error.test.tsx)
3. Unit (async mock): `data.strips = []` (not pending/error) → “No note categories on Home.” ([1]) — [`tests/home/starred-notes-read/async-section/unit/home-notes-section-empty.test.tsx`](../../../../tests/home/starred-notes-read/async-section/unit/home-notes-section-empty.test.tsx)
4. Unit (async mock): fixture with ≥1 strip → strip header / cards render (not empty/loading) ([1]) — [`tests/home/starred-notes-read/async-section/unit/home-notes-section-success.test.tsx`](../../../../tests/home/starred-notes-read/async-section/unit/home-notes-section-success.test.tsx)

**HIGHEST CONFIDENCE(s):**
1. E2E: open Home signed-in → notes area leaves loading and shows real strips or empty ([1]–[3])

---
