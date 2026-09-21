/**
 * @file tests/home/tenant-isolation/notes/int/get-home-notes-response.test.ts
 * Locks CHEAPEST.1 for Home notes tenant isolation — View — read home strips.
 *
 * Doc: docs/testing/home/1-tenant-isolation/notes.md
 *      → section "View — read home strips"
 *      → decision table cell: **Should** × **Integration** × item 1 (CHEAPEST.1)
 *      → CHEAPEST TEST(s) #1
 *
 * Contract: `getHomeNotesResponse(userA)` with A+B seeded on `mf_testing_*`
 *           → strip note ids are only A's ([5]–[6] in the flow).
 *
 * Why this cell (not Unit / E2E): cheapest proof that use-case → repo
 * scoping excludes User B. UI/fetch layers ([1]–[3]) never introduce userId.
 *
 * What stays real: getHomeNotesResponse + repo `.eq("user_id", userId)`.
 * What is fixtured: live twin tables (`MF_TABLE_PREFIX=mf_testing_`), seed
 * rows from migration 045, service-role client (bypasses RLS so the app
 * filter is what we prove — not cookie auth; that is CHEAPEST.2 / HIGHEST).
 */

import { beforeAll, describe, expect, it, vi } from "vitest";

import type { HomeNotesResponse } from "@/entities/note/model/read-models";

// Fixed A/B user + note ids from migrations 044–045 (mf_testing_* seed).
import {
  ISOLATION_USER_A_ID,
  NOTE_A_HOME_IDS,
  NOTE_B_HOME_IDS,
} from "@/tests/home/fixtures";

// Next `cookies()` / publishable session are not available in Vitest.
// Swap the server client for a service-role client: talks to the real project,
// bypasses RLS, so isolation proved here is userId → repo `.eq("user_id", …)`.
vi.mock("@/shared/lib/supabase/server", async () => {
  // Lazy import keeps the helper out of the hoisted mock factory graph.
  const { createIsolationSupabaseClient } = await import(
    "@/tests/setup/create-isolation-supabase-client"
  );

  return {
    createClient: async () => createIsolationSupabaseClient(),
  };
});

// Import after vi.mock so getHomeNotesResponse’s repos use the mocked client.
import { getHomeNotesResponse } from "@/entities/note/queries/get-home-notes-response";
// Table name constants — beforeAll asserts they resolve to mf_testing_*.
import {
  NOTE_CATEGORIES_TABLE,
  NOTES_TABLE,
} from "@/shared/config/supabase-tables";

/**
 * Flattens Home strip payload → note ids (quick slot + starred list).
 * Used so assertions stay about ownership, not strip shape.
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

describe("getHomeNotesResponse — Home notes tenant isolation (CHEAPEST.1)", () => {
  // Guard: int setup must point repos at twins, never live mf_notes.
  beforeAll(() => {
    expect(NOTES_TABLE).toBe("mf_testing_notes");
    expect(NOTE_CATEGORIES_TABLE).toBe("mf_testing_note_categories");
  });

  /////////////////////////////////////////////////////////////
  // CHEAPEST.1 — Should × Integration
  // Doc cell why: cheapest proof that use-case → repo scoping excludes User B.
  // Flow steps under test: [5] getHomeNotesResponse, [6] getQuickNote /
  //   getStarredNotesForHomeStrip (.eq("user_id", userId)).
  // Protects: signed-in user only sees their own Home strip notes.
  // Regression: User A’s strips include User B’s quick/starred note ids.

  it("returns only user A's note ids when A and B fixtures are seeded", async () => {
    // Act — same entry the API/SSR path calls after session → userId.
    const response = await getHomeNotesResponse(ISOLATION_USER_A_ID);
    const noteIds = collectHomeNoteIds(response);

    // Seed must be present (migration 045); empty strips would pass a weak assert.
    expect(noteIds.length).toBeGreaterThan(0);

    // Exact ownership set for A (quick + starred fixture ids).
    expect(noteIds.sort()).toEqual([...NOTE_A_HOME_IDS].sort());

    // Explicit cross-tenant leak check (B’s seeded ids must never appear).
    for (const foreignId of NOTE_B_HOME_IDS) {
      expect(noteIds).not.toContain(foreignId);
    }
  });
});
