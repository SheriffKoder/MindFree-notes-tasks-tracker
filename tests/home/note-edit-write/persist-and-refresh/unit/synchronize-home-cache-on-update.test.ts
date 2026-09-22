/**
 * @file tests/home/note-edit-write/persist-and-refresh/unit/synchronize-home-cache-on-update.test.ts
 * Locks CHEAPEST.2 for Note edit (write) — Edit — PATCH persists + Home strip reflects.
 *
 * Doc: docs/testing/home/5-note-edit-write/persist-and-refresh.md
 *      → section "Edit — PATCH persists + Home strip reflects"
 *      → decision table cell: **Should** × **Unit** × item 2 (CHEAPEST.2)
 *      → CHEAPEST TEST(s) #2
 *
 * Contract: **proves:** Home cache reflected the change —
 *           `synchronizeNoteCaches({ type: "update", previous, next })` →
 *           `homeNotesQueryKey` strip shows `next` title/content ([5]).
 *
 * Why this cell (not Integration / E2E): pure/cache contract without network;
 * DB persist is CHEAPEST.1; cache→UI is CHEAPEST.3.
 *
 * What stays real: `synchronizeNoteCaches` / `applyHomeNoteUpdate`.
 * What is mocked: none (in-memory QueryClient only).
 */

import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { synchronizeNoteCaches } from "@/entities/note/cache/synchronize-note-caches";
import { homeNotesQueryKey } from "@/entities/note/client/query-keys";
import type { HomeNotesResponse } from "@/entities/note/model/read-models";
import type { Note } from "@/entities/note/model/types";
import {
  FIXTURE_HOME_NOTES_WITH_STRIP,
  FIXTURE_HOME_STRIP_DIARY,
  FIXTURE_STARRED_NOTE,
} from "@/tests/home/fixtures";

/////////////////////////////////////////////////////////////
// Edited note — same id/category/starred; new title/content for the assert.
/////////////////////////////////////////////////////////////

const UPDATED_STARRED_NOTE: Note = {
  ...FIXTURE_STARRED_NOTE,
  title: "Fixture starred title — after save",
  content: "Fixture starred body — Home cache reflected",
  lastEditedAt: "2026-09-21T12:00:00.000Z",
  revision: 2,
};

describe("synchronizeNoteCaches — Note edit write persist (CHEAPEST.2)", () => {
  /////////////////////////////////////////////////////////////
  // CHEAPEST.2 — Should × Unit (cache)
  // Doc cell why: pure/cache contract — Home cache reflects `next` without network.
  // Flow step under test: [5] synchronizeNoteCaches → homeNotesQueryKey.
  // Protects: after an update, Home strip cache shows the new fields.
  // Regression: cache still holds previous title/content after sync.

  it("updates title and content on the Home strip cache for a starred note", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    // Arrange — Home already has the fixture starred card (pre-save cache).
    queryClient.setQueryData(
      homeNotesQueryKey,
      structuredClone(FIXTURE_HOME_NOTES_WITH_STRIP),
    );

    // Act — same sync path the update mutation runs after a successful PATCH.
    synchronizeNoteCaches(queryClient, {
      type: "update",
      previous: FIXTURE_STARRED_NOTE,
      next: UPDATED_STARRED_NOTE,
    });

    // Assert — Home cache strip shows `next`, not the previous fixture text.
    const home =
      queryClient.getQueryData<HomeNotesResponse>(homeNotesQueryKey);
    const strip = home?.strips.find(
      (entry) => entry.categoryId === FIXTURE_HOME_STRIP_DIARY.categoryId,
    );
    const starred = strip?.starredNotes.find(
      (note) => note.id === FIXTURE_STARRED_NOTE.id,
    );

    expect(starred).toBeDefined();
    expect(starred!.title).toBe(UPDATED_STARRED_NOTE.title);
    expect(starred!.content).toBe(UPDATED_STARRED_NOTE.content);
    expect(starred!.title).not.toBe(FIXTURE_STARRED_NOTE.title);
    expect(starred!.content).not.toBe(FIXTURE_STARRED_NOTE.content);
  });
});
