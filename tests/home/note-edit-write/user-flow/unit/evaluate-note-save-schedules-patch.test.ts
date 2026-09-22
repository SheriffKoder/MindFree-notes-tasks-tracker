/**
 * @file tests/home/note-edit-write/user-flow/unit/evaluate-note-save-schedules-patch.test.ts
 * Locks CHEAPEST.2 for Note edit (write) — Edit — open drawer and autosave from Home.
 *
 * Doc: docs/testing/home/5-note-edit-write/user-flow.md
 *      → section "Edit — open drawer and autosave from Home"
 *      → decision table cell: **Should** × **Unit** × item 2 (CHEAPEST.2)
 *      → CHEAPEST TEST(s) #2
 *
 * Contract: persisted note + dirty valid values → `evaluateNoteSave` action is
 *           `"patch"` (not create-* / noop) ([4]–[5] boundary before mutate).
 *
 * Why this cell (not Integration / E2E): pure pipeline owns update-vs-create;
 * debounce + TanStack mutate are glue once action is `"patch"`.
 *
 * What stays real: `evaluateNoteSave` decideAction for existing dirty notes.
 * What is mocked: none (pure function); network is out of scope here.
 */

import { describe, expect, it } from "vitest";

import type { NoteFormValues } from "@/entities/note/editor/model/types";
import { evaluateNoteSave } from "@/features/notes/note-drawer/pre-save-orchestrator/evaluate-note-save";
import { FIXTURE_STARRED_NOTE } from "@/tests/home/fixtures";

/////////////////////////////////////////////////////////////
// Fixture form values — dirty content on an existing Home starred note.
/////////////////////////////////////////////////////////////

const DIRTY_EDIT_VALUES: NoteFormValues = {
  title: FIXTURE_STARRED_NOTE.title,
  content: "Edited starred body",
  starred: true,
  isImportant: false,
  categoryId: FIXTURE_STARRED_NOTE.categoryId,
};

describe("evaluateNoteSave — Note edit write user flow (CHEAPEST.2)", () => {
  /////////////////////////////////////////////////////////////
  // CHEAPEST.2 — Should × Unit (user flow / pure evaluate)
  // Doc cell why: proves dirty existing note schedules update, not create.
  // Flow steps under test: [4] evaluateNoteSave → action patch ([5] mutate input).
  // Protects: autosave chooses PATCH for a real note id that is dirty+valid.
  // Regression: create-* or noop when the user edited an existing note.

  it("returns action patch for a persisted dirty valid note", () => {
    const result = evaluateNoteSave({
      values: DIRTY_EDIT_VALUES,
      meta: { isDirty: true, isValid: true },
      note: FIXTURE_STARRED_NOTE,
      request: { mode: "edit", noteId: FIXTURE_STARRED_NOTE.id },
      activeDate: null,
      isDateNavEnabled: false,
      lastPickedDate: null,
      replaceConfirmed: false,
      findNoteOnDate: () => null,
    });

    expect(result.action).toBe("patch");
    expect(result.action).not.toBe("create-general");
    expect(result.action).not.toBe("create-quick");
    expect(result.action).not.toBe("create-calendar");
    expect(result.action).not.toBe("noop");
    expect(result.isSavingEnabled).toBe(true);
  });

  /////////////////////////////////////////////////////////////
  // Contrast — same note without dirty meta must not schedule a write.

  it("returns action noop when the persisted note form is not dirty", () => {
    const result = evaluateNoteSave({
      values: DIRTY_EDIT_VALUES,
      meta: { isDirty: false, isValid: true },
      note: FIXTURE_STARRED_NOTE,
      request: { mode: "edit", noteId: FIXTURE_STARRED_NOTE.id },
      activeDate: null,
      isDateNavEnabled: false,
      lastPickedDate: null,
      replaceConfirmed: false,
      findNoteOnDate: () => null,
    });

    expect(result.action).toBe("noop");
  });
});
