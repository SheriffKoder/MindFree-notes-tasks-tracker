/**
 * @file tests/home/note-edit-write/continuous-proof/e2e/restore-starred-note-seed.ts
 * Service-role cleanup for the Note edit continuous-proof E2E.
 *
 * Purpose: Reset User A’s starred seed text on `mf_testing_notes` so the
 *          next browser run stays deterministic.
 * Used in: note-edit-write-continuous-proof.spec.ts (before/after)
 * Used for: Doc step 7 — cleanup only; never part of the pass/fail contract.
 *
 * Steps:
 * 1. Ensure env + twin-table prefix are loaded for the Playwright Node process.
 * 2. Open a service-role client (bypasses RLS).
 * 3. Write seed title/content back onto NOTE_A_STARRED_ID.
 */

import "@/tests/setup/load-app-env";

import {
  NOTE_A_STARRED_ID,
  NOTE_A_STARRED_SEED_CONTENT,
  NOTE_A_STARRED_SEED_TITLE,
} from "@/tests/home/fixtures";
import { createIsolationSupabaseClient } from "@/tests/setup/create-isolation-supabase-client";

/** Twin notes table — matches Playwright webServer `MF_TABLE_PREFIX`. */
const TESTING_NOTES_TABLE = "mf_testing_notes";

/**
 * Restores migration-045 title/content on the User A starred note row.
 *
 * @throws Error when the service-role update fails
 */
export async function restoreStarredNoteSeed(): Promise<void> {
  /////////////////////////////////////////////////////////////
  // Twin tables only — never touch live `mf_notes` from E2E cleanup.
  process.env.MF_TABLE_PREFIX = "mf_testing_";

  /////////////////////////////////////////////////////////////
  // Service-role client — cleanup boundary only (not the pass/fail assert).
  const supabase = createIsolationSupabaseClient();

  /////////////////////////////////////////////////////////////
  // Write seed text back so Home strip shows "User A starred note" again.
  const { error } = await supabase
    .from(TESTING_NOTES_TABLE)
    .update({
      title: NOTE_A_STARRED_SEED_TITLE,
      content: NOTE_A_STARRED_SEED_CONTENT,
    })
    .eq("id", NOTE_A_STARRED_ID);

  if (error) {
    throw new Error(
      `Failed to restore starred note seed (${NOTE_A_STARRED_ID}): ${error.message}`,
    );
  }
}
