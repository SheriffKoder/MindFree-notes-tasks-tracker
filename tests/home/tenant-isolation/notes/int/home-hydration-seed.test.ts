/**
 * @file tests/home/tenant-isolation/notes/int/home-hydration-seed.test.ts
 * Locks CHEAPEST.1 for Home notes tenant isolation — View — SSR seed (parallel).
 *
 * Doc: docs/testing/home/1-tenant-isolation/notes.md
 *      → section "View — SSR seed (parallel)"
 *      → decision table cell: **Should** × **Integration** × item 1 (CHEAPEST.1)
 *      → CHEAPEST TEST(s) #1
 *
 * Contract: no session → `HomeHydrationSeed` rejects with `Unauthorized` and must
 *           not call `getHomeNotesResponse` / `seedHomeNotesCache` ([1]–[2]).
 *
 * Why this cell (not Unit / E2E): cheapest proof that SSR seed stops at the
 * session gate — no strips without auth. Complements CHEAPEST.2
 * (`home-hydration-seed-user-a-strips.test.ts` — scoped strips when session is A).
 *
 * What stays real: `getAuthenticatedDemoSession` (throws when `getUser` is null)
 *                  and `HomeHydrationSeed` up to that await.
 * What is fixtured: Supabase server client with no user; note/activity seeders
 *                   mocked so a leak would show as a call; `connection()` stubbed.
 */

import { describe, expect, it, vi } from "vitest";

// Spies — assert SSR never fetches or seeds strips when auth fails.
const getHomeNotesResponse = vi.fn();
const seedHomeNotesCache = vi.fn();
const getNoteCategoriesResponse = vi.fn();
const seedNoteCategoriesCache = vi.fn();
const getHomeActivityInitialData = vi.fn();
const seedHomeActivityCaches = vi.fn();

// Next.js dynamic marker — not available under Vitest.
vi.mock("next/server", () => ({
  connection: async () => undefined,
}));

// Replace note server barrel: seed path imports several exports; spies prove
// none of the notes strip reads/writes run after auth failure.
vi.mock("@/entities/note/server", () => ({
  getHomeNotesResponse: (...args: unknown[]) => getHomeNotesResponse(...args),
  getNoteCategoriesResponse: (...args: unknown[]) =>
    getNoteCategoriesResponse(...args),
  seedHomeNotesCache: (...args: unknown[]) => seedHomeNotesCache(...args),
  seedNoteCategoriesCache: (...args: unknown[]) =>
    seedNoteCategoriesCache(...args),
}));

// Activity is also seeded in parallel after session; stub so the module loads.
vi.mock("@/entities/activity/server", () => ({
  getHomeActivityInitialData: (...args: unknown[]) =>
    getHomeActivityInitialData(...args),
  seedHomeActivityCaches: (...args: unknown[]) =>
    seedHomeActivityCaches(...args),
}));

// No session → createClient().auth.getUser() returns null → real
// getAuthenticatedDemoSession throws "Unauthorized" (CHEAPEST.1 boundary).
vi.mock("@/shared/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  }),
}));

// Import after vi.mock so HomeHydrationSeed sees the stubs above.
import { HomeHydrationSeed } from "@/views/home/ui/home-hydration-seed";

describe("HomeHydrationSeed — Home notes tenant isolation (SSR CHEAPEST.1)", () => {
  /////////////////////////////////////////////////////////////
  // CHEAPEST.1 — Should × Integration
  // Doc cell why: cheapest proof that SSR seed stops at the session gate.
  // Flow steps under test: [1] HomeHydrationSeed, [2] getAuthenticatedDemoSession.
  // Protects: unauthenticated request never SSR-seeds Home note strips.
  // Regression: no-session seed still calls getHomeNotesResponse / seedHomeNotesCache.

  it("throws Unauthorized and does not seed strips when there is no session", async () => {
    getHomeNotesResponse.mockReset();
    seedHomeNotesCache.mockReset();
    getNoteCategoriesResponse.mockReset();
    seedNoteCategoriesCache.mockReset();
    getHomeActivityInitialData.mockReset();
    seedHomeActivityCaches.mockReset();

    await expect(HomeHydrationSeed()).rejects.toThrow("Unauthorized");

    expect(getHomeNotesResponse).not.toHaveBeenCalled();
    expect(seedHomeNotesCache).not.toHaveBeenCalled();
    expect(getNoteCategoriesResponse).not.toHaveBeenCalled();
    expect(seedNoteCategoriesCache).not.toHaveBeenCalled();
    expect(getHomeActivityInitialData).not.toHaveBeenCalled();
    expect(seedHomeActivityCaches).not.toHaveBeenCalled();
  });
});
