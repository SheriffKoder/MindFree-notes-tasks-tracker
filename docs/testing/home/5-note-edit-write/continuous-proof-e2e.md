# Note edit (write) — Continuous proof (E2E)

Part of [Home — Note edit (write)](./README.md).  
Maps to **Continuous proof — E2E** under Notes in
[../1-what-matters.md](../1-what-matters.md).

Stitched CHEAPEST stays: faster, pinpoint failures.
E2E is the one expensive continuous proof of the Notes stitch as a single wire.

| Related | Role |
| ------- | ---- |
| [user-flow.md](./user-flow.md) | CHEAPEST open-edit + schedule update |
| [persist-and-refresh.md](./persist-and-refresh.md) | CHEAPEST DB / cache / cache→UI; defines HIGHEST.1 |

---

## What this end to end test answers

- **What confidence does Playwright give me that Vitest / RTL cannot?**  
  That login → Home → edit → strip update → hard reload still works when
  session, API, DB, TanStack cache, and UI are all real — not mocked at the
  boundaries the CHEAPEST tests isolate.
- **Do the pieces still work when they are wired together for real?**  
  Yes/no for one happy path. A failure here means a seam broke; use CHEAPEST
  to pinpoint which link.
- **Why are we using a real DB, and how?**  
  Reload must prove persist, not only in-memory cache. Run the Next app with
  `MF_TABLE_PREFIX=mf_testing_` so Home-domain tables (`notes`, categories,
  tasks, payments) use the isolation twins. Profile / preferences / security
  stay on live `mf_*` (auth-trigger seeded). Assert via **what the user sees**
  after reload — do not query Supabase inside the E2E for the pass/fail
  contract. Service-role (or seed replay) is only for **cleanup / reset**.

---

## What is a good journey

How a user reads it / steps inside the test:

`authenticated >> notes load >> notes show >> click note >> update >> strip updates >> reload still new`

**Pseudo:**

```text
1. login as isolation-a@example.com
2. open Home
3. see seeded starred strip text ("User A starred note")
4. click that starred card → drawer opens for that note
5. change body (unique suffix) → wait until strip shows new text
6. hard reload Home → strip still shows that new text
7. cleanup: restore seeded title/content on NOTE_A_STARRED_ID
```

---

## What this journey answers

- Can an isolation user sign in and reach Home?
- Do Home note strips load and show the seeded starred note?
- Can they open that note from the strip, edit it, and see the strip update
  without a full reload?
- After a hard refresh, does the new text still appear (real persist)?

---

## What this journey proves

- Login → Home routing with a real session
- Home strips render from the real home-notes path (`mf_testing_*`)
- Strip click → note drawer for that note
- Edit + autosave in a real browser → strip text updates
- Hard reload → updated text still visible (UI-facing persist)

Assert **only** user-visible outcomes (and reload). No cache keys, no
`evaluateNoteSave`, no mutation spies.

---

## What this journey does not prove

Keep these in Vitest / existing CHEAPEST (or later items):

- Loading / error / empty Home notes panels — [async-section](../2-starred-notes-read/async-section.md)
- Tenant isolation / `userId` scoping — [tenant isolation notes](../1-tenant-isolation/notes.md)
- Open-edit wiring in isolation — [user-flow](./user-flow.md) CHEAPEST.1
- `evaluateNoteSave` → patch (not create) — [user-flow](./user-flow.md) CHEAPEST.2
- Row fields / revision via repository — [persist-and-refresh](./persist-and-refresh.md) CHEAPEST.1
- `synchronizeNoteCaches` Home apply — [persist-and-refresh](./persist-and-refresh.md) CHEAPEST.2
- Cache subscription → strip without network — [persist-and-refresh](./persist-and-refresh.md) CHEAPEST.3
- Every drawer validation message, create/quick-note, edit isolation of User B’s rows

---

## Prerequisites

| Piece | Value |
| ----- | ----- |
| Auth user | `isolation-a@example.com` / `IsolationPass123!` (migration `044`) |
| Seeded note | `NOTE_A_STARRED_ID` — title `A starred`, content `User A starred note` (migration `045`) |
| Tables | Home-domain `mf_testing_*` via `MF_TABLE_PREFIX=mf_testing_` (profile/security stay on live `mf_*`) |
| App | Next.js running against that prefix + normal Supabase URL/keys |
| Cleanup | Restore seeded title/content after the run (service-role or re-seed) |

Fixtures: [`tests/home/fixtures/isolation-users.ts`](../../../../tests/home/fixtures/isolation-users.ts),
[`tests/home/fixtures/isolation-notes.ts`](../../../../tests/home/fixtures/isolation-notes.ts).

---

## How to run

The Playwright harness is configured for Chromium. Its `webServer` starts
Next.js and gives the server `MF_TABLE_PREFIX=mf_testing_`.

1. **Browser (first run / Playwright upgrade)**:

   ```bash
   npx playwright install chromium
   ```

2. **Env** — use the same Supabase project and keys as int tests.
3. **Migrations** — apply `044` / `045` so the isolation user + starred seed
   exist.
4. **Run** — from the repo root:

   ```bash
   npm run test:e2e
   npm run test:e2e:headed
   npm run test:e2e:ui
   ```

5. **After** — confirm cleanup restored `User A starred note` (or re-run seed)
   so the next run stays deterministic.

Open a generated clickable suite by opening its timestamped HTML file, or use
Playwright's report server with that run's directory:

```bash
npx playwright show-report playwright-reports/<NNN-timestamp>
```

Local runs retain indexed+timestamped copies such as
`test-results/001-2026-…/` and `playwright-reports/001-2026-…/index.html`
(next run becomes `002-…`). CI uses one `test-results/` and
`playwright-report/` folder per Actions run because the workflow run already
provides versioned retention.

The smoke spec is [`tests/e2e/login.spec.ts`](../../../../tests/e2e/login.spec.ts).
The continuous journey is
[`tests/home/note-edit-write/continuous-proof/e2e/note-edit-write-continuous-proof.spec.ts`](../../../../tests/home/note-edit-write/continuous-proof/e2e/note-edit-write-continuous-proof.spec.ts).

Run only that file:

```bash
npm run test:e2e -- tests/home/note-edit-write/continuous-proof/e2e/note-edit-write-continuous-proof.spec.ts
```

---
