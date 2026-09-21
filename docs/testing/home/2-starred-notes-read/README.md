# Home — Starred notes (read)

Priority 2 from [../1-what-matters.md](../1-what-matters.md).

**Success:** Starred notes display, grouped by home categories.  
**Protect against:** Empty/wrong strips; notes missing or in the wrong category.

Unlike [tenant isolation](../1-tenant-isolation/), this area practices **display
correctness** — loading/error/empty UI, strip mapping, and dumb strip
components — with the network/query mocked at the boundary. Ownership of
`userId` is already covered under Priority 1.

**Main testing skills** (from `testing-2.js` / practice map):

| Skill | Where it shows up here |
| ----- | ---------------------- |
| Async sections (mock only) | [async-section.md](./async-section.md) — `HomeNotesSection` pending / error / empty / success |
| Testing functions (grouping/mapping) | [grouping.md](./grouping.md) — strips per `showOnHome` category; Diary vs other starred rules; `selectDiaryStrip` |
| Testing components (isolated + props) | [strip-ui.md](./strip-ui.md) — strip carousel, empty panel, category header |

| Group | Doc |
| ----- | --- |
| [Async section](./async-section.md) | View — load home strips |
| [Grouping](./grouping.md) | View — build strips by category |
| [Strip UI](./strip-ui.md) | View — render strip / empty / switch |

**Unit tests:** `tests/home/starred-notes-read/…/unit/` — `npm run test:unit`
(includes Vitest project `unit-dom` / happy-dom for `.tsx`).

---

## Prompt template (copy for each View / Edit flow)

Paste and fill. Keep heading levels and order. For this priority, tag
**display / grouping** risks (not isolation) with `⚠︎ failure: … (Should.n)`.

````markdown
### {{View|Edit}} — {{short flow name}}

- **What user behavior am I protecting?** {{one sentence}}
- **What would a regression look like to a user?** {{what the user would notice}}
- **What is the external boundary?** {{DB / network / clock / session — mock that, not domain}}
- **What must stay real?** {{pure helpers, validation, mapping, userId scoping, …}}
- **How will I know I’m done?** {{named contracts green — not “coverage went up”}}

#### Flow — how it happens + where it can break

Forward chain from Home UI → data. Display risks: `⚠︎ failure: … (Should.n)` —
tag matches the **Should** row item (same number as CHEAPEST.n). Use `(Nice)` /
`(HIGHEST.n)` when only those cover the step.

[1] {{Name}} to {{do what}} [@path/to/file]({{relative-link}})
⚠︎ failure: {{display risk}} (Should.n)
↓
[2] {{Name}} to {{do what}} [@path/to/file]({{relative-link}})
↓
[…] …

Number CHEAPEST / HIGHEST lists. In table cells, if more than one item, number
them and point at the list: `1. (CHEAPEST.2) **Why:** …` (contract text lives
in the numbered list; the cell carries the why / role).

| | Unit | Integration | E2E |
| --- | --- | --- | --- |
| **Should** | — or single what+why | 1. (CHEAPEST.1) **Why:** … <br> 2. (CHEAPEST.2) **Why:** … | — or 1. (HIGHEST.n) **Why:** … |
| **Nice** | — | {{what + why, or —}} | 1. (HIGHEST.1) **Why:** … |
| **Skip** | {{what + why}} | — | — |

**CHEAPEST TEST(s):**
1. {{layer}}: {{contract}} ({{steps}})
2. {{layer}}: {{contract}} ({{steps}})

**HIGHEST CONFIDENCE(s):**
1. {{layer}}: {{contract}} ({{steps}})

---
````
