# Tenant isolation — Notes

Part of [Home — Tenant isolation](./README.md).

### View — read home strips

- **What user behavior am I protecting?** A signed-in user opening Home only ever sees their own starred/quick notes in the category strips — never another account’s.
- **What would a regression look like to a user?** User A sees User B’s note titles/content (or empty/wrong strips), or an anonymous visitor gets a successful notes payload instead of being blocked.
- **What is the external boundary?** Auth session (cookie → `userId`) and the notes DB (`mf_notes` / categories scoped by `user_id`) — mock or fixture those boundaries; do not mock the domain rule “strips belong to this user.”
- **What must stay real?** `getHomeNotesResponse` wiring `userId` into repo reads, and repo filters (`.eq("user_id", userId)`); the `{ strips }` mapping that only includes rows returned for that user.
- **How will I know I’m done?** Contracts green: (1) with A+B seeded, `getHomeNotesResponse(userA)` returns only A’s note ids; (2) `GET /api/notes/home` with no session returns 401 — not “coverage went up.”

#### Flow — how it happens + where it can break

Forward chain from Home UI → DB. Steps that can leak another user’s notes are marked with `! failure`.

[1] HomeNotesSection to show category strips (quick + starred) [@views/home/ui/home-notes-section.tsx](../../../../views/home/ui/home-notes-section.tsx)  
! failure: UI renders another user's strips from a bad payload/cache  
↓  
[2] useHomeNotesQuery to read strips from the TanStack cache [@entities/note/hooks/use-home-notes-query.ts](../../../../entities/note/hooks/use-home-notes-query.ts)  
↓  
[3] fetchHomeNotes to GET /api/notes/home for the strips payload [@entities/note/client/home-notes-query.ts](../../../../entities/note/client/home-notes-query.ts)  
↓  
[4] GET /api/notes/home that resolves session userId via requireAuthenticatedUserId [@app/api/notes/home/route.ts](../../../../app/api/notes/home/route.ts)  
! failure: no session still returns data, or body/query supplies userId  
↓  
[5] getHomeNotesResponse to build strips only for that userId [@entities/note/queries/get-home-notes-response.ts](../../../../entities/note/queries/get-home-notes-response.ts)  
! failure: strips built without scoping to session userId  
↓  
[6] getQuickNote / getStarredNotesForHomeStrip that filter mf_notes by user_id [@entities/note/repository/get-quick-note.ts](../../../../entities/note/repository/get-quick-note.ts) · [@entities/note/repository/get-starred-notes-for-home-strip.ts](../../../../entities/note/repository/get-starred-notes-for-home-strip.ts)  
! failure: repo query omits `.eq("user_id", userId)` and returns User B's notes

| | Unit | Integration | E2E |
| --- | --- | --- | --- |
| **Should** | — | 1. (CHEAPEST.1) **Why:** cheapest proof that use-case → repo scoping excludes User B. <br> 2. (CHEAPEST.2) **Why:** proves the route does not serve data without a session. | — |
| **Nice** | — | **What:** authenticated `GET /api/notes/home` as User A → payload ids are only A's. **Why:** also covers route → use-case wiring; optional if CHEAPEST already gives enough confidence. | 1. (HIGHEST.1) **Why:** highest confidence across cookie → UI; expensive, so only when you want more than integration. |
| **Skip** | **What:** unit tests of `HomeNotesSection` / `useHomeNotesQuery` / `fetchHomeNotes` ([1]–[3]). **Why:** those layers never introduce `userId` — they only render or forward whatever the API returns. A unit with mocked strips asserts the mock, not tenant isolation. | — | — |

**CHEAPEST TEST(s):**
1. Integration: `getHomeNotesResponse(userA)` with seeded notes for A + B → strips contain only A's ids ([5]–[6]) — [`tests/home/int/get-home-notes-response.test.ts`](../../../../tests/home/int/get-home-notes-response.test.ts)
2. Integration: `GET /api/notes/home` with no session → 401 ([4]) — [`tests/home/int/get-notes-home-route.test.ts`](../../../../tests/home/int/get-notes-home-route.test.ts)

**HIGHEST CONFIDENCE(s):**
1. E2E (or authenticated API as two users): login as A then B → each Home strips payload shows only that user's notes ([1]–[6])

---

### View — SSR seed (parallel)

[1] HomeHydrationSeed to prefetch home caches before paint [@views/home/ui/home-hydration-seed.tsx](../../../../views/home/ui/home-hydration-seed.tsx)  
↓  
[2] getAuthenticatedDemoSession that introduces userId from the session [@shared/lib/auth/get-demo-session.ts](../../../../shared/lib/auth/get-demo-session.ts)  
! failure: missing session seeds anyway, or wrong userId is used  
↓  
[3] getHomeNotesResponse to build the same user-scoped strips (no HTTP) [@entities/note/queries/get-home-notes-response.ts](../../../../entities/note/queries/get-home-notes-response.ts)  
! failure: strips built without scoping to session userId  
↓  
[4] seedHomeNotesCache to put that payload into the client cache (same user scope)

---

### Edit — quick create

[1] HomeNotesSection to open the quick-slot create flow [@views/home/ui/home-notes-section.tsx](../../../../views/home/ui/home-notes-section.tsx)  
! failure: create flow continues without an authenticated session  
↓  
[2] POST /api/notes/home that resolves session userId via requireAuthenticatedUserId [@app/api/notes/home/route.ts](../../../../app/api/notes/home/route.ts)  
! failure: no session still creates, or body supplies userId  
↓  
[3] createQuickNote to insert a note owned by that userId [@entities/note/mutations/create-quick-note.ts](../../../../entities/note/mutations/create-quick-note.ts)  
! failure: create runs without session userId  
↓  
[4] repository INSERT that sets user_id from the session (must not trust body.userId)  
! failure: INSERT uses client userId or omits user_id

---

### Edit — update existing note

[1] HomeNotesSection to open edit on a starred / quick note [@views/home/ui/home-notes-section.tsx](../../../../views/home/ui/home-notes-section.tsx)  
! failure: edit opens/saves a note that belongs to another user  
↓  
[2] PATCH /api/notes/[id] that resolves session userId via requireAuthenticatedUserId [@app/api/notes/[id]/route.ts](../../../../app/api/notes/[id]/route.ts)  
! failure: no session still patches, or body supplies userId  
↓  
[3] updateNote to patch only if the row belongs to that userId [@entities/note/mutations/update-note.ts](../../../../entities/note/mutations/update-note.ts)  
! failure: update runs without userId ownership check  
↓  
[4] repository UPDATE that constrains with .eq("user_id", userId) [@entities/note/repository/update-note.ts](../../../../entities/note/repository/update-note.ts)  
! failure: UPDATE matches by id only and mutates User B's note

**Soft spot:** client-supplied `categoryId` not re-owned in app code (FK/RLS still contain it). Cache key not namespaced by `userId`.
