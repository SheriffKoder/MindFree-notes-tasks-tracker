/**
 * @file tests/home/note-edit-write/persist-and-refresh/int/update-note-persists-row.test.ts
 * Locks CHEAPEST.1 for Note edit (write) — Edit — PATCH persists + Home strip reflects.
 *
 * Doc: docs/testing/home/5-note-edit-write/persist-and-refresh.md
 *      → section "Edit — PATCH persists + Home strip reflects"
 *      → decision table cell: **Should** × **Integration** × item 1 (CHEAPEST.1)
 *      → CHEAPEST TEST(s) #1
 *
 * Contract: **proves:** row changed in DB — `updateNote` on a seeded
 *           `mf_testing_notes` row updates title/content ([3]–[4]).
 *
 * Why this cell (not Unit / E2E): cheapest proof the write path lands on the
 * twin table. Home UI refresh is CHEAPEST.2; browser both-sides is HIGHEST.1.
 *
 * What stays real: `updateNote` → `updateNoteById` against `mf_testing_*`.
 * What is mocked: Next `cookies()` / publishable session → service-role client
 * (same boundary as tenant-isolation int tests).
 */

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// Fixed User A starred note from migrations 044–045 (mf_testing_* seed).
import {
  ISOLATION_USER_A_ID,
  NOTE_A_STARRED_ID,
} from "@/tests/home/fixtures";

/////////////////////////////////////////////////////////////
// Boundary mock — service-role client so repos hit real mf_testing_* tables.
/////////////////////////////////////////////////////////////

// Next `cookies()` / publishable session are not available in Vitest.
// Swap the server client for a service-role client: talks to the real project.
vi.mock("@/shared/lib/supabase/server", async () => {
  const { createIsolationSupabaseClient } = await import(
    "@/tests/setup/create-isolation-supabase-client"
  );

  return {
    createClient: async () => createIsolationSupabaseClient(),
  };
});

// Import after vi.mock so updateNote’s repos use the mocked client.
import { findNoteById } from "@/entities/note/repository/update-note";
import { updateNote } from "@/entities/note/mutations/update-note";
import {
  NOTE_CATEGORIES_TABLE,
  NOTES_TABLE,
} from "@/shared/config/supabase-tables";

/** Seed copy restored after the write so other int tests keep a stable fixture. */
const SEED_STARRED_TITLE = "A starred";
const SEED_STARRED_CONTENT = "User A starred note";

/** Distinct payload so a no-op update cannot pass the assert. */
const UPDATED_TITLE = "A starred — CHEAPEST.1 persist";
const UPDATED_CONTENT = "User A starred note — row changed in DB";

describe("updateNote — Note edit write persist (CHEAPEST.1)", () => {
  // Guard: int setup must point repos at twins, never live mf_notes.
  beforeAll(() => {
    expect(NOTES_TABLE).toBe("mf_testing_notes");
    expect(NOTE_CATEGORIES_TABLE).toBe("mf_testing_note_categories");
  });

  /////////////////////////////////////////////////////////////
  // Restore seed title/content so isolation reads stay deterministic.
  // Revision may stay elevated — seed only cares about text for Home strips.

  afterAll(async () => {
    const current = await findNoteById(ISOLATION_USER_A_ID, NOTE_A_STARRED_ID);

    if (!current) {
      return;
    }

    if (
      current.title === SEED_STARRED_TITLE &&
      current.content === SEED_STARRED_CONTENT
    ) {
      return;
    }

    await updateNote(ISOLATION_USER_A_ID, NOTE_A_STARRED_ID, {
      title: SEED_STARRED_TITLE,
      content: SEED_STARRED_CONTENT,
      expectedRevision: current.revision,
    });
  });

  /////////////////////////////////////////////////////////////
  // CHEAPEST.1 — Should × Integration
  // Doc cell why: proves write actually lands on mf_testing_* (or route + DB).
  // Flow steps under test: [3]–[4] updateNote / repository persist.
  // Protects: save actually changes the note row (not a silent no-op).
  // Regression: response looks ok but title/content unchanged in DB.

  it("persists updated title and content on the seeded mf_testing_notes row", async () => {
    // Arrange — read current revision (seed starts at 1; may be higher if re-run).
    const before = await findNoteById(ISOLATION_USER_A_ID, NOTE_A_STARRED_ID);

    expect(before).not.toBeNull();
    expect(before!.id).toBe(NOTE_A_STARRED_ID);

    // Act — same use-case the PATCH route calls after session → userId.
    const updated = await updateNote(ISOLATION_USER_A_ID, NOTE_A_STARRED_ID, {
      title: UPDATED_TITLE,
      content: UPDATED_CONTENT,
      expectedRevision: before!.revision,
    });

    // Assert — use-case return reflects the write.
    expect(updated.title).toBe(UPDATED_TITLE);
    expect(updated.content).toBe(UPDATED_CONTENT);
    expect(updated.revision).toBeGreaterThan(before!.revision);

    // Assert — DB round-trip (not only the in-memory return value).
    const after = await findNoteById(ISOLATION_USER_A_ID, NOTE_A_STARRED_ID);

    expect(after).not.toBeNull();
    expect(after!.title).toBe(UPDATED_TITLE);
    expect(after!.content).toBe(UPDATED_CONTENT);
  });
});
