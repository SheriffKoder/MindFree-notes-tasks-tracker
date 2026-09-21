/**
 * @file tests/home/fixtures/home-notes-strips.ts
 * Fixture Home notes strips for starred-notes (read) unit / async mocks.
 */

import type {
  HomeNotesResponse,
  HomeNotesStrip,
} from "@/entities/note/model/read-models";
import type { Note } from "@/entities/note/model/types";

/** Minimal starred note for Home strip card assertions. */
export const FIXTURE_STARRED_NOTE: Note = {
  id: "fixture-starred-note-1",
  date: null,
  title: "Fixture starred title",
  content: "Fixture starred body",
  starred: true,
  isImportant: false,
  isQuick: false,
  lastEditedAt: "2026-09-20T12:00:00.000Z",
  revision: 1,
  categoryId: "fixture-category-diary",
};

/** One showOnHome Diary strip with empty quick slot + one starred note. */
export const FIXTURE_HOME_STRIP_DIARY: HomeNotesStrip = {
  categoryId: "fixture-category-diary",
  categoryName: "Diary",
  isDefault: true,
  quickNote: null,
  starredNotes: [FIXTURE_STARRED_NOTE],
};

/** Settled home-notes payload with ≥1 strip (async CHEAPEST.4 / strip UI). */
export const FIXTURE_HOME_NOTES_WITH_STRIP: HomeNotesResponse = {
  strips: [FIXTURE_HOME_STRIP_DIARY],
};
