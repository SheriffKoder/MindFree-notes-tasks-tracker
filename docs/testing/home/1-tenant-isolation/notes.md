# Tenant isolation — Notes

Part of [Home — Tenant isolation](./README.md).

### View — read home strips

- **What user behavior am I protecting?** A signed-in user opening Home only ever sees their own starred/quick notes in the category strips — never another account’s.
- **What would a regression look like to a user?** User A sees User B’s note titles/content (or empty/wrong strips), or an anonymous visitor gets a successful notes payload instead of being blocked.
- **What is the external boundary?** Auth session (cookie → `userId`) and the notes DB (`mf_notes` / categories scoped by `user_id`) — mock or fixture those boundaries; do not mock the domain rule “strips belong to this user.”
- **What must stay real?** `getHomeNotesResponse` wiring `userId` into repo reads, and repo filters (`.eq("user_id", userId)`); the `{ strips }` mapping that only includes rows returned for that user.
- **How will I know I’m done?** Contracts green: (1) with A+B seeded, `getHomeNotesResponse(userA)` returns only A’s note ids; (2) `GET /api/notes/home` with no session returns 401 — not “coverage went up.”

#### Flow — how it happens + where it can break

Forward chain from Home UI → DB. Isolation risks: `⚠︎ failure: … (Should.n)` —
tag matches the **Should** row item (same number as CHEAPEST.n). Use `(Nice)` /
`(HIGHEST.n)` when only those cover the step.

[1] HomeNotesSection to show category strips (quick + starred) [@views/home/ui/home-notes-section.tsx](../../../../views/home/ui/home-notes-section.tsx)  
⚠︎ failure: UI renders another user's strips from a bad payload/cache (HIGHEST.1)  
↓  
[2] useHomeNotesQuery to read strips from the TanStack cache [@entities/note/hooks/use-home-notes-query.ts](../../../../entities/note/hooks/use-home-notes-query.ts)  
↓  
[3] fetchHomeNotes to GET /api/notes/home for the strips payload [@entities/note/client/home-notes-query.ts](../../../../entities/note/client/home-notes-query.ts)  
↓  
[4] GET /api/notes/home that resolves session userId via requireAuthenticatedUserId [@app/api/notes/home/route.ts](../../../../app/api/notes/home/route.ts)  
⚠︎ failure: no session still returns data, or body/query supplies userId (Should.2)  
↓  
[5] getHomeNotesResponse to build strips only for that userId [@entities/note/queries/get-home-notes-response.ts](../../../../entities/note/queries/get-home-notes-response.ts)  
⚠︎ failure: strips built without scoping to session userId (Should.1)  
↓  
[6] getQuickNote / getStarredNotesForHomeStrip that filter mf_notes by user_id [@entities/note/repository/get-quick-note.ts](../../../../entities/note/repository/get-quick-note.ts) · [@entities/note/repository/get-starred-notes-for-home-strip.ts](../../../../entities/note/repository/get-starred-notes-for-home-strip.ts)  
⚠︎ failure: repo query omits `.eq("user_id", userId)` and returns User B's notes (Should.1)

| | Unit | Integration | E2E |
| --- | --- | --- | --- |
| **Should** | — | 1. (CHEAPEST.1) **Why:** cheapest proof that use-case → repo scoping excludes User B. <br> 2. (CHEAPEST.2) **Why:** proves the route does not serve data without a session. | — |
| **Nice** | — | **What:** authenticated `GET /api/notes/home` as User A → payload ids are only A's. **Why:** also covers route → use-case wiring; optional if CHEAPEST already gives enough confidence. | 1. (HIGHEST.1) **Why:** highest confidence across cookie → UI; expensive, so only when you want more than integration. |
| **Skip** | **What:** unit tests of `HomeNotesSection` / `useHomeNotesQuery` / `fetchHomeNotes` ([1]–[3]). **Why:** those layers never introduce `userId` — they only render or forward whatever the API returns. A unit with mocked strips asserts the mock, not tenant isolation. | — | — |

**CHEAPEST TEST(s):**
1. Integration: `getHomeNotesResponse(userA)` with seeded notes for A + B → strips contain only A's ids ([5]–[6]) — [`tests/home/tenant-isolation/notes/int/get-home-notes-response.test.ts`](../../../../tests/home/tenant-isolation/notes/int/get-home-notes-response.test.ts)
2. Integration: `GET /api/notes/home` with no session → 401 ([4]) — [`tests/home/tenant-isolation/notes/int/get-notes-home-route.test.ts`](../../../../tests/home/tenant-isolation/notes/int/get-notes-home-route.test.ts)

**HIGHEST CONFIDENCE(s):**
1. E2E (or authenticated API as two users): login as A then B → each Home strips payload shows only that user's notes ([1]–[6])

---

### View — SSR seed (parallel)

- **What user behavior am I protecting?** On first paint of Home, the SSR-seeded notes cache belongs only to the signed-in user — never another account’s strips before client refetch.
- **What would a regression look like to a user?** User A’s first paint (or hydrated cache) shows User B’s note titles/content, or an unauthenticated request still seeds a notes payload into the page.
- **What is the external boundary?** Auth session (cookie → `userId` via `getAuthenticatedDemoSession`) and the notes DB — mock or fixture those; do not mock the rule “seeded strips belong to this user.”
- **What must stay real?** Session → `userId` into `getHomeNotesResponse`, and repo filters (`.eq("user_id", userId)`); seeding only the payload returned for that user.
- **How will I know I’m done?** Contracts green: (1) no session → `getAuthenticatedDemoSession` throws and strips are not seeded; (2) with A+B seeded, SSR path for User A only puts A’s note ids in the home-notes cache — not “coverage went up.”

#### Flow — how it happens + where it can break

Forward chain from Home SSR seed → DB. Isolation risks: `⚠︎ failure: … (Should.n)` —
tag matches the **Should** row item (same number as CHEAPEST.n). Use `(Nice)` /
`(HIGHEST.n)` when only those cover the step.

[1] HomeHydrationSeed to prefetch home caches before paint [@views/home/ui/home-hydration-seed.tsx](../../../../views/home/ui/home-hydration-seed.tsx)  
⚠︎ failure: seed runs without a session (Should.1); or seeds strips for the wrong userId (Should.2)  
↓  
[2] getAuthenticatedDemoSession that introduces userId from the session [@shared/lib/auth/get-demo-session.ts](../../../../shared/lib/auth/get-demo-session.ts)  
⚠︎ failure: missing session still returns a userId / does not throw, so seed continues (Should.1)  
↓  
[3] getHomeNotesResponse to build the same user-scoped strips (no HTTP) [@entities/note/queries/get-home-notes-response.ts](../../../../entities/note/queries/get-home-notes-response.ts)  
⚠︎ failure: strips built without scoping to session userId (Should.2)  
↓  
[4] seedHomeNotesCache to write that payload into the QueryClient [@entities/note/hydration/seed-home-notes-cache.ts](../../../../entities/note/hydration/seed-home-notes-cache.ts)  
⚠︎ failure: cache seeded with another user's payload (Should.2)

| | Unit | Integration | E2E |
| --- | --- | --- | --- |
| **Should** | — | 1. (CHEAPEST.1) **Why:** cheapest proof that SSR seed stops at the session gate — no strips without auth. <br> 2. (CHEAPEST.2) **Why:** proves SSR threads session `userId` into scoped strips and seeds only that user's ids. | — |
| **Nice** | — | — | 1. (HIGHEST.1) **Why:** highest confidence that first paint / hydrated strips are only the signed-in user's; expensive vs integration. |
| **Skip** | **What:** unit tests of `seedHomeNotesCache` / `QueryHydration` in isolation ([4]). **Why:** the seeder only `setQueryData`s whatever payload it receives — it never introduces `userId`. Ownership is proved by what CHEAPEST.2 passes into the spy, not by unit-testing the seeder. | — | — |

**CHEAPEST TEST(s):**
1. Integration: no session → `HomeHydrationSeed` throws (`Unauthorized`); `getHomeNotesResponse` / `seedHomeNotesCache` never run ([1]–[2]) — [`tests/home/tenant-isolation/notes/int/home-hydration-seed.test.ts`](../../../../tests/home/tenant-isolation/notes/int/home-hydration-seed.test.ts)
2. Integration: session User A → `HomeHydrationSeed` seeds only A's note ids ([1], [3]–[4]) — [`tests/home/tenant-isolation/notes/int/home-hydration-seed-user-a-strips.test.ts`](../../../../tests/home/tenant-isolation/notes/int/home-hydration-seed-user-a-strips.test.ts) (same use-case as [View — read home strips](#view--read-home-strips) CHEAPEST.1)

**HIGHEST CONFIDENCE(s):**
1. E2E: login as A → Home first paint / hydrated strips show only A's notes ([1]–[4])

---

### Edit — quick create

[1] HomeNotesSection to open the quick-slot create flow [@views/home/ui/home-notes-section.tsx](../../../../views/home/ui/home-notes-section.tsx)  
⚠︎ failure: create flow continues without an authenticated session  
↓  
[2] POST /api/notes/home that resolves session userId via requireAuthenticatedUserId [@app/api/notes/home/route.ts](../../../../app/api/notes/home/route.ts)  
⚠︎ failure: no session still creates, or body supplies userId  
↓  
[3] createQuickNote to insert a note owned by that userId [@entities/note/mutations/create-quick-note.ts](../../../../entities/note/mutations/create-quick-note.ts)  
⚠︎ failure: create runs without session userId  
↓  
[4] repository INSERT that sets user_id from the session (must not trust body.userId)  
⚠︎ failure: INSERT uses client userId or omits user_id

---

### Edit — update existing note

[1] HomeNotesSection to open edit on a starred / quick note [@views/home/ui/home-notes-section.tsx](../../../../views/home/ui/home-notes-section.tsx)  
⚠︎ failure: edit opens/saves a note that belongs to another user  
↓  
[2] PATCH /api/notes/[id] that resolves session userId via requireAuthenticatedUserId [@app/api/notes/[id]/route.ts](../../../../app/api/notes/[id]/route.ts)  
⚠︎ failure: no session still patches, or body supplies userId  
↓  
[3] updateNote to patch only if the row belongs to that userId [@entities/note/mutations/update-note.ts](../../../../entities/note/mutations/update-note.ts)  
⚠︎ failure: update runs without userId ownership check  
↓  
[4] repository UPDATE that constrains with .eq("user_id", userId) [@entities/note/repository/update-note.ts](../../../../entities/note/repository/update-note.ts)  
⚠︎ failure: UPDATE matches by id only and mutates User B's note

**Soft spot:** client-supplied `categoryId` not re-owned in app code (FK/RLS still contain it). Cache key not namespaced by `userId`.
