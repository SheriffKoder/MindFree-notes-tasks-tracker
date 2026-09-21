# Home — Note edit (write)

Priority 5 from [../1-what-matters.md](../1-what-matters.md).

**Success:** Edit/update a note; change persists and UI reflects it.  
**Protect against:** DB not updated, or UI stale after save.

Unlike [tenant isolation](../1-tenant-isolation/) (ownership of PATCH) and
[starred notes read](../2-starred-notes-read/) (display panels), this area
practices **write correctness from Home** — open the drawer, autosave, prove
the row changes, and prove the Home strip cache updates. Isolation of
`userId` on PATCH is already Priority 1.

**Main testing skills** (from `testing-2.js` / practice map):

| Skill | Where it shows up here |
| ----- | ---------------------- |
| User flow | [user-flow.md](./user-flow.md) — Home strip click → drawer → form change → pre-save schedules PATCH |
| API mocking / Integration | [persist-and-refresh.md](./persist-and-refresh.md) — mutation persists; Home strip cache / UI refreshes |

| Group | Doc |
| ----- | --- |
| [User flow](./user-flow.md) | Edit — open drawer and autosave from Home |
| [Persist + refresh](./persist-and-refresh.md) | Edit — PATCH persists + Home strip reflects |

**Persist + refresh — CHEAPEST TEST(s)** (see [persist-and-refresh.md](./persist-and-refresh.md)):

1. Integration — **proves:** row changed in DB
2. Unit — **proves:** Home cache reflected the change
3. Unit (component) — **proves:** Home UI reflected the cache

**Unit tests:** `tests/home/note-edit-write/…/unit/` — `npm run test:unit`
(includes Vitest project `unit-dom` / happy-dom for `.tsx`).

**Integration tests:** `tests/home/note-edit-write/…/int/` — `npm run test:int`
(`mf_testing_*` + service-role client).

---

## Prompt template (copy for each View / Edit flow)

Paste and fill. Keep heading levels and order. For this priority, tag
**write / stale-UI** risks (not isolation) with `⚠︎ failure: … (Should.n)`.

Only the **CHEAPEST TEST(s)** list leads with **proves:** (short outcome).
Table cells and HIGHEST keep the usual **Why:** / contract wording.

````markdown
### {{View|Edit}} — {{short flow name}}

- **What user behavior am I protecting?** {{one sentence}}
- **What would a regression look like to a user?** {{what the user would notice}}
- **What is the external boundary?** {{DB / network / clock / session — mock that, not domain}}
- **What must stay real?** {{pure helpers, validation, mapping, userId scoping, …}}
- **How will I know I’m done?** {{named contracts green — not “coverage went up”}}

#### Flow — how it happens + where it can break

Forward chain from Home UI → data. Write risks: `⚠︎ failure: … (Should.n)` —
tag matches the **Should** row item (same number as CHEAPEST.n). Use `(Nice)` /
`(HIGHEST.n)` when only those cover the step.

[1] {{Name}} to {{do what}} [@path/to/file]({{relative-link}})
⚠︎ failure: {{write / stale-UI risk}} (Should.n)
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
1. {{layer}} — **proves:** {{outcome}} ({{steps}}) {{optional file link}}
2. {{layer}} — **proves:** {{outcome}} ({{steps}}) {{optional file link}}

**HIGHEST CONFIDENCE(s):**
1. {{layer}}: {{contract}} ({{steps}})

---
````
