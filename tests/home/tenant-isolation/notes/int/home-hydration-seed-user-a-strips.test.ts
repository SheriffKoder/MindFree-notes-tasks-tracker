/**
 * @file tests/home/tenant-isolation/notes/int/home-hydration-seed-user-a-strips.test.ts
 * Locks CHEAPEST.2 for Home notes tenant isolation — View — SSR seed (parallel).
 *
 * Doc: docs/testing/home/1-tenant-isolation/notes.md
 *      → section "View — SSR seed (parallel)"
 *      → decision table cell: **Should** × **Integration** × item 2 (CHEAPEST.2)
 *      → CHEAPEST TEST(s) #2
 *
 * Contract: `HomeHydrationSeed` with session User A + A/B seeded on `mf_testing_*`
 *           → `getHomeNotesResponse(userA)` then `seedHomeNotesCache` receives only
 *           A's note ids ([1], [3]–[4]).
 *
 * Why this cell (not Unit / E2E): proves the no-HTTP SSR path threads session
 * `userId` into the same scoped use-case as View — read, and seeds that payload.
 *
 * What stays real: `getHomeNotesResponse` + repo `.eq("user_id", userId)`;
 *                  `HomeHydrationSeed` orchestration after session.
 * What is fixtured: session → User A; service-role Supabase client; categories /
 *                   activity stubs; `seedHomeNotesCache` spy (assert call args);
 *                   `connection()` stubbed.
 */

import { beforeAll, describe, expect, it, vi } from "vitest";

import type { HomeNotesResponse } from "@/entities/note/model/read-models";
import {
  ISOLATION_USER_A_ID,
  NOTE_A_HOME_IDS,
  NOTE_B_HOME_IDS,
} from "@/tests/home/fixtures";

// Spy — capture the SSR notes payload written into the QueryClient.
const seedHomeNotesCache = vi.fn();

// Next.js dynamic marker — not available under Vitest.
vi.mock("next/server", () => ({
  connection: async () => undefined,
}));

// Session is User A (SSR introduces userId here; no cookie stack in Vitest).
vi.mock("@/shared/lib/auth/get-demo-session", () => ({
  getAuthenticatedDemoSession: async () => ({
    userId: ISOLATION_USER_A_ID,
    isDemoUser: false,
  }),
}));

// Real getHomeNotesResponse against mf_testing_*; spy only the notes cache seed.
vi.mock("@/entities/note/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/entities/note/server")>();

  return {
    ...actual,
    seedHomeNotesCache: (...args: unknown[]) => seedHomeNotesCache(...args),
    getNoteCategoriesResponse: async () => ({ categories: [] }),
    seedNoteCategoriesCache: vi.fn(),
  };
});

// Activity is parallel in HomeHydrationSeed — stub so this test stays notes-scoped.
vi.mock("@/entities/activity/server", () => ({
  getHomeActivityInitialData: async () => ({
    month: "2026-09",
    tasks: { activities: [] },
    reminders: { activities: [] },
    records: { month: "2026-09", records: [] },
  }),
  seedHomeActivityCaches: vi.fn(),
}));

// Service-role client: real twin tables, bypass RLS — prove app userId scoping.
vi.mock("@/shared/lib/supabase/server", async () => {
  const { createIsolationSupabaseClient } = await import(
    "@/tests/setup/create-isolation-supabase-client"
  );

  return {
    createClient: async () => createIsolationSupabaseClient(),
  };
});

// Import after vi.mock so HomeHydrationSeed sees the stubs above.
import { HomeHydrationSeed } from "@/views/home/ui/home-hydration-seed";
import {
  NOTE_CATEGORIES_TABLE,
  NOTES_TABLE,
} from "@/shared/config/supabase-tables";

/**
 * Flattens Home strip payload → note ids (quick slot + starred list).
 */
function collectHomeNoteIds(response: HomeNotesResponse): string[] {
  const ids: string[] = [];

  for (const strip of response.strips) {
    if (strip.quickNote) {
      ids.push(strip.quickNote.id);
    }
    for (const note of strip.starredNotes) {
      ids.push(note.id);
    }
  }

  return ids;
}

describe("HomeHydrationSeed — Home notes tenant isolation (SSR CHEAPEST.2)", () => {
  beforeAll(() => {
    expect(NOTES_TABLE).toBe("mf_testing_notes");
    expect(NOTE_CATEGORIES_TABLE).toBe("mf_testing_note_categories");
  });

  /////////////////////////////////////////////////////////////
  // CHEAPEST.2 — Should × Integration
  // Doc cell why: proves SSR threads session userId into scoped strips + seed.
  // Flow steps under test: [1] HomeHydrationSeed, [3] getHomeNotesResponse,
  //   [4] seedHomeNotesCache (call args).
  // Protects: first-paint / hydrated strips belong only to the signed-in user.
  // Regression: User A's SSR seed includes User B's quick/starred note ids.

  it("seeds only user A's note ids when session is A and A+B fixtures exist", async () => {
    seedHomeNotesCache.mockReset();

    await HomeHydrationSeed();

    expect(seedHomeNotesCache).toHaveBeenCalledTimes(1);

    const seeded = seedHomeNotesCache.mock.calls[0]?.[1] as HomeNotesResponse;
    const noteIds = collectHomeNoteIds(seeded);

    expect(noteIds.length).toBeGreaterThan(0);
    expect(noteIds.sort()).toEqual([...NOTE_A_HOME_IDS].sort());

    for (const foreignId of NOTE_B_HOME_IDS) {
      expect(noteIds).not.toContain(foreignId);
    }
  });
});
