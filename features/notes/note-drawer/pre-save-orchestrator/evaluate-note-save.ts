/**
 * @file features/notes/note-drawer/pre-save-orchestrator/evaluate-note-save.ts
 * Pre-save pipeline — sequential checks from form values to save action.
 *
 * Purpose: Pure rules for date↔general routing, conflicts, and mutation choice.
 * Used in: pre-save-orchestrator/use-pre-save-orchestrator.ts
 * Used for: Step 11 drawer saves — no TanStack or React in this module.
 *
 * Function index:
 * - resolveOpeningCalendarDate, isGeneralCreateRequest, isCalendarDateContext
 * - hasMeaningfulContent, shouldDeleteCalendarNoteOnEmptyContent
 * - evaluateNoteSave: main pipeline (see Steps below)
 *
 * Steps (evaluateNoteSave):
 * 1. resolveDate — bind ISO date from picker, existing note, or lazy-create prefill.
 * 2. normalizePayload — force formatted calendar title when date is bound.
 * 3. Validation gate — block save when form meta is invalid.
 * 4. Conflict gate — find occupant on target day; block until replace confirmed.
 * 5. decideAction — noop, create-calendar, create-general, patch, or delete.
 */

import {
  formatCalendarNoteTitle,
  isDateFormattedTitle,
} from "@/entities/note/editor/lib/format-calendar-note-title";
import type {
  NoteFormChangeMeta,
  NoteFormValues,
} from "@/entities/note/editor/model/types";
import type { Note } from "@/entities/note";
import type { NoteEditorRequest } from "@/views/notes/model/editor/note-editor-request";
import type {
  EvaluateNoteSaveInput,
  EvaluateNoteSaveResult,
  NoteSaveAction,
  NoteSavePayload,
} from "@/features/notes/note-drawer/pre-save-orchestrator/types";

/**
 * @returns active ISO date for calendar create/navigation context.
 */
export function resolveOpeningCalendarDate(
  activeDate: string | null,
  request: NoteEditorRequest | null,
): string | null {
  if (activeDate) {
    return activeDate;
  }

  if (request?.mode === "create" && "date" in request) {
    return request.date;
  }

  return null;
}

/**
 * @returns whether the drawer is in general lazy-create mode.
 */
export function isGeneralCreateRequest(
  request: NoteEditorRequest | null,
): boolean {
  return request?.mode === "create" && "general" in request;
}

/**
 * @returns whether the drawer is in quick-note lazy-create mode.
 */
export function isQuickCreateRequest(
  request: NoteEditorRequest | null,
): boolean {
  return request?.mode === "create" && "quick" in request;
}

/**
 * @returns whether calendar date create/edit routing applies.
 */
export function isCalendarDateContext(
  request: NoteEditorRequest | null,
  activeDate: string | null,
  isDateNavEnabled: boolean,
): boolean {
  if (isDateNavEnabled && activeDate) {
    return true;
  }

  return request?.mode === "create" && "date" in request;
}

/**
 * @returns whether the form has text worth persisting.
 *
 * Calendar notes only count `content` for lazy create when a date is resolved.
 */
export function hasMeaningfulContent(
  values: NoteFormValues,
  date: string | null = null,
): boolean {
  if (date) {
    return Boolean(values.content.trim());
  }

  return Boolean(values.title.trim() || values.content.trim());
}

/**
 * Calendar dated notes delete when content is cleared; general notes never auto-delete.
 */
export function shouldDeleteCalendarNoteOnEmptyContent(
  note: Note,
  values: NoteFormValues,
  meta: NoteFormChangeMeta,
): boolean {
  return Boolean(note.date) && meta.isDirty && values.content.trim() === "";
}

/**
 * Option A — only picker re-bind, existing note date, or lazy-create prefill bind calendar.
 */
function resolveDate(input: EvaluateNoteSaveInput): string | null {
  const { values, note, request, activeDate, lastPickedDate, isDateNavEnabled } =
    input;

  if (
    lastPickedDate &&
    isDateFormattedTitle(values.title, lastPickedDate)
  ) {
    return lastPickedDate;
  }

  if (note?.date && isDateFormattedTitle(values.title, note.date)) {
    return note.date;
  }

  const openingDate = resolveOpeningCalendarDate(activeDate, request);

  if (
    !note?.id &&
    openingDate &&
    isCalendarDateContext(request, activeDate, isDateNavEnabled) &&
    isDateFormattedTitle(values.title, openingDate)
  ) {
    return openingDate;
  }

  return null;
}

function normalizePayload(
  values: NoteFormValues,
  date: string | null,
): NoteSavePayload {
  if (date) {
    return {
      ...values,
      title: formatCalendarNoteTitle(date),
      date,
    };
  }

  return {
    ...values,
    date: null,
  };
}

/**
 * Quick notes never keep a calendar date or title — content-only slot.
 */
function applyQuickNoteInvariants(payload: NoteSavePayload): NoteSavePayload {
  return {
    ...payload,
    title: "",
    date: null,
    isQuick: true,
  };
}

/**
 * @returns whether an existing quick note should leave the home quick slot.
 */
function shouldGraduateQuickNote(
  values: NoteFormValues,
  date: string | null,
): boolean {
  if (date) {
    return true;
  }

  return Boolean(values.title.trim());
}

/**
 * Applies quick-slot promotion/graduation rules after date resolution.
 */
function applyQuickSlotRules(
  payload: NoteSavePayload,
  input: EvaluateNoteSaveInput,
  date: string | null,
): NoteSavePayload {
  const { note, request } = input;

  if (note?.isQuick) {
    if (shouldGraduateQuickNote(input.values, date)) {
      return {
        ...payload,
        isQuick: false,
      };
    }

    return applyQuickNoteInvariants(payload);
  }

  if (isQuickCreateRequest(request)) {
    return applyQuickNoteInvariants(payload);
  }

  return payload;
}

function findConflict(
  findNoteOnDate: EvaluateNoteSaveInput["findNoteOnDate"],
  date: string,
  excludeId?: string,
): { date: string; existingNoteId: string } | null {
  const existing = findNoteOnDate(date, excludeId);

  if (!existing) {
    return null;
  }

  return { date, existingNoteId: existing.id };
}

function decideAction(
  input: EvaluateNoteSaveInput,
  payload: NoteSavePayload,
): NoteSaveAction {
  const { note, meta, request } = input;
  const date = payload.date;

  if (!note?.id) {
    if (!hasMeaningfulContent(payload, date) || !meta.isValid) {
      return "noop";
    }

    if (date) {
      return "create-calendar";
    }

    if (isGeneralCreateRequest(request)) {
      return "create-general";
    }

    if (isQuickCreateRequest(request)) {
      if (input.values.title.trim()) {
        return "create-general";
      }

      return "create-quick";
    }

    return "noop";
  }

  if (shouldDeleteCalendarNoteOnEmptyContent(note, payload, meta)) {
    return "delete";
  }

  if (!meta.isDirty || !meta.isValid) {
    return "noop";
  }

  return "patch";
}

function buildBlockedResult(
  payload: NoteSavePayload,
  effectiveDateNavEnabled: boolean,
  conflict: EvaluateNoteSaveResult["conflict"],
): EvaluateNoteSaveResult {
  return {
    payload,
    effectiveDateNavEnabled,
    isSavingEnabled: false,
    conflict,
    action: "noop",
    replaceExistingOnDate: false,
  };
}

/**
 * Runs the pre-save pipeline: resolve date → normalize → conflict gate → action.
 */
export function evaluateNoteSave(
  input: EvaluateNoteSaveInput,
): EvaluateNoteSaveResult {
  /////////////////////////////////
  // 1. Resolve ISO date from picker intent, existing note, or lazy-create context
  const date = resolveDate(input);

  /////////////////////////////////
  // 2. Normalize payload — calendar notes always use the formatted date title
  const payload = applyQuickSlotRules(
    normalizePayload(input.values, date),
    input,
    date,
  );
  const effectiveDateNavEnabled = date !== null;

  /////////////////////////////////
  // 3. Validation gate — invalid form blocks autosave without surfacing conflict
  if (!input.meta.isValid) {
    return buildBlockedResult(payload, effectiveDateNavEnabled, null);
  }

  /////////////////////////////////
  // 4. Conflict gate — one note per calendar day unless user confirmed replace
  const conflict = date
    ? findConflict(input.findNoteOnDate, date, input.note?.id)
    : null;

  const isSavingEnabled = !conflict || input.replaceConfirmed;

  if (!isSavingEnabled) {
    return buildBlockedResult(payload, effectiveDateNavEnabled, conflict);
  }

  /////////////////////////////////
  // 5. Decide mutation — noop, create, patch, or delete from normalized payload
  const action = decideAction(input, payload);

  return {
    payload,
    effectiveDateNavEnabled,
    isSavingEnabled: true,
    conflict: null,
    action,
    replaceExistingOnDate: Boolean(conflict && input.replaceConfirmed),
  };
}
