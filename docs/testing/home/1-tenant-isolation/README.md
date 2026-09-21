# Home — Tenant isolation

Priority 1 from [../1-what-matters.md](../1-what-matters.md).

**Success:** Logged-in user sees only their notes, tasks, reminders; payment writes are theirs.  
**Protect against:** User A receives or mutates User B's data.

`userId` is never taken from the client body. It is introduced at the API/SSR
boundary (`requireAuthenticatedUserId` / `getAuthenticatedDemoSession`) and
threaded into use-cases → repositories (`.eq("user_id", userId)` /
`user_id: userId`), with RLS `auth.uid() = user_id` as a backstop.

**DB fixtures (hosted project):** migration `043` adds `mf_testing_*` twins;
`044` adds dedicated auth users (do not use as daily logins):

| | Email | Fixed id |
| --- | --- | --- |
| A | `isolation-a@example.com` | `a2222222-2222-4222-8222-222222222222` |
| B | `isolation-b@example.com` | `b3333333-3333-4333-8333-333333333333` |

Password for both: `IsolationPass123!` (also listed in `.env.example`).

**Seeded fixture ids** (migration `045`, date `2026-09-20` where relevant):

| Kind | User A | User B |
| --- | --- | --- |
| Category | `a2000001-0001-4001-8001-000000000001` | `b3000001-0001-4001-8001-000000000001` |
| Quick note | `a2000002-0002-4002-8002-000000000002` | `b3000002-0002-4002-8002-000000000002` |
| Starred note | `a2000003-0003-4003-8003-000000000003` | `b3000003-0003-4003-8003-000000000003` |
| Task | `a2000010-0010-4010-8010-000000000010` | `b3000010-0010-4010-8010-000000000010` |
| Reminder | `a2000011-0011-4011-8011-000000000011` | `b3000011-0011-4011-8011-000000000011` |
| Task record | `a2000020-0020-4020-8020-000000000020` | `b3000020-0020-4020-8020-000000000020` |
| Payment | `a2000030-0030-4030-8030-000000000030` | `b3000030-0030-4030-8030-000000000030` |

**Notes int tests:** `tests/home/tenant-isolation/notes/int/` — run with
`npm run test:int` (needs `SUPABASE_SERVICE_ROLE_KEY` + migrations `043`–`045`).

| Entity | Doc |
| ------ | --- |
| [Notes](./notes.md) | Home strips read / create / edit |
| [Tasks](./tasks.md) | Today's tasks read / toggle |
| [Reminders](./reminders.md) | Today's reminders read / toggle / quick add |
| [Payments](./payments.md) | Home payment create |

---

## Prompt template (copy for each View / Edit flow)

Use the filled [View — read home strips](./notes.md#view--read-home-strips) as the
layout reference. Paste the block below into chat (or a new section) and fill
the placeholders. Keep the same heading levels and order.

````markdown
### {{View|Edit}} — {{short flow name}}

- **What user behavior am I protecting?** {{one sentence}}
- **What would a regression look like to a user?** {{what the user would notice}}
- **What is the external boundary?** {{DB / network / clock / session — mock that, not domain}}
- **What must stay real?** {{pure helpers, validation, mapping, userId scoping, …}}
- **How will I know I’m done?** {{named contracts green — not “coverage went up”}}

#### Flow — how it happens + where it can break

Forward chain from Home UI → DB. Isolation risks: `⚠︎ failure: … (Should.n)` —
tag matches the **Should** row item (same number as CHEAPEST.n). Use `(Nice)` /
`(HIGHEST.n)` when only those cover the step.

[1] {{Name}} to {{do what}} [@path/to/file]({{relative-link}})
⚠︎ failure: {{isolation risk}} (Should.n)
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

**Agent prompt (optional):** paste this with the template:

> Fill the template for `{{View|Edit}} — {{flow}}` under tenant isolation for
> `{{notes|tasks|reminders|payments}}`. Match the layout of
> `docs/testing/home/1-tenant-isolation/notes.md` → View — read home strips.
> Trace real files in the repo. Mark isolation risks with
> `⚠︎ failure: … (Should.n)` (or `(Nice)` / `(HIGHEST.n)` when only those cover it).
> Put Unit under Skip when the layer does not own `userId` / cannot prove
> isolation — explain why in the cell. Number CHEAPEST/HIGHEST lists; when a
> cell has multiple items, number them and link with `(CHEAPEST.n)` /
> `(HIGHEST.n)`.
