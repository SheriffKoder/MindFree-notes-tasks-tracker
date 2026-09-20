/**
 * @file tests/home/fixtures/isolation-notes.ts
 * Fixed note/category fixture ids from migration 045 (mf_testing_*).
 */

/** User A Diary category on `mf_testing_note_categories`. */
export const NOTE_CATEGORY_A_ID = "a2000001-0001-4001-8001-000000000001";

/** User B Diary category on `mf_testing_note_categories`. */
export const NOTE_CATEGORY_B_ID = "b3000001-0001-4001-8001-000000000001";

/** User A quick note on `mf_testing_notes`. */
export const NOTE_A_QUICK_ID = "a2000002-0002-4002-8002-000000000002";

/** User A starred note on `mf_testing_notes`. */
export const NOTE_A_STARRED_ID = "a2000003-0003-4003-8003-000000000003";

/** User B quick note on `mf_testing_notes`. */
export const NOTE_B_QUICK_ID = "b3000002-0002-4002-8002-000000000002";

/** User B starred note on `mf_testing_notes`. */
export const NOTE_B_STARRED_ID = "b3000003-0003-4003-8003-000000000003";

/** All User A home-strip note ids from the one-time seed. */
export const NOTE_A_HOME_IDS = [NOTE_A_QUICK_ID, NOTE_A_STARRED_ID] as const;

/** All User B home-strip note ids from the one-time seed. */
export const NOTE_B_HOME_IDS = [NOTE_B_QUICK_ID, NOTE_B_STARRED_ID] as const;
