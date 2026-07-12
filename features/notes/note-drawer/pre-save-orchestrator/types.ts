/**
 * @file features/notes/note-drawer/pre-save-orchestrator/types.ts
 * Contracts for the pre-save evaluation pipeline and hook.
 *
 * Purpose: Shared types between evaluate-note-save and use-pre-save-orchestrator.
 * Used in: pre-save-orchestrator/evaluate-note-save.ts, use-pre-save-orchestrator.ts,
 *          features/notes/note-drawer/ui/note-drawer.tsx
 * Used for: Pipeline input/output, save actions, conflict shape, and hook API.
 */

import type {
  NoteFormChangeMeta,
  NoteFormValues,
  NoteSaveStatus,
} from "@/entities/note/editor/model/types";
import type { Note } from "@/entities/note";
import type { NoteEditorRequest } from "@/views/notes/model/editor/note-editor-request";

/** Resolved save intent after the check-after-check pipeline. */
export type NoteSaveAction =
  | "patch"
  | "create-calendar"
  | "create-general"
  | "delete"
  | "noop";

export interface NoteSavePayload extends NoteFormValues {
  /** `YYYY-MM-DD` for calendar notes; `null` for general. */
  date: string | null;
}

export interface EvaluateNoteSaveInput {
  values: NoteFormValues;
  meta: NoteFormChangeMeta;
  note: Note | null;
  request: NoteEditorRequest | null;
  activeDate: string | null;
  isDateNavEnabled: boolean;
  /** Set by the date picker only (Option A re-bind). */
  lastPickedDate: string | null;
  /** User confirmed Replace on a same-day conflict (Step 4+). */
  replaceConfirmed: boolean;
  /** Cache adapter — returns another note on the day, if any. */
  findNoteOnDate: (date: string, excludeId?: string) => Note | null;
}

export interface EvaluateNoteSaveResult {
  payload: NoteSavePayload;
  effectiveDateNavEnabled: boolean;
  isSavingEnabled: boolean;
  conflict: { date: string; existingNoteId: string } | null;
  action: NoteSaveAction;
  replaceExistingOnDate: boolean;
}

export interface UsePreSaveOrchestratorOptions {
  note: Note | null;
  isOpen: boolean;
  request: NoteEditorRequest | null;
  activeDate: string | null;
  isDateNavEnabled: boolean;
  /** Switches general create intent to edit mode after the first row exists. */
  onGeneralNoteCreated: (noteId: string) => void;
}

export interface UsePreSaveOrchestratorResult {
  saveStatus: NoteSaveStatus;
  handleChange: (values: NoteFormValues, meta: NoteFormChangeMeta) => void;
  commitKey: number;
  effectiveDateNavEnabled: boolean;
  isSavingEnabled: boolean;
  conflict: { date: string; existingNoteId: string } | null;
  resolveReplace: () => void;
  resolveDismiss: () => void;
  /** Step 2 — records picker intent; returns formatted title for the form. */
  applyPickedDate: (isoDate: string) => string;
  /** Re-run pipeline after remote cache sync — conflict/nav only, no schedule. */
  reevaluateFromCache: () => void;
}
