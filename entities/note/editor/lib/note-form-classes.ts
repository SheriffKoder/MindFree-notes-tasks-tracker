/**
 * @file entities/note/editor/lib/note-form-classes.ts
 * Shared layout class tokens for the note editor form.
 */

import type { CSSProperties } from "react";

import { NOTE_FORM_STYLE_CONFIG } from "@/entities/note/editor/lib/note-form-style-config";
import type { NoteSaveStatus } from "@/entities/note/editor/model/types";

export const PLAIN_TITLE_CLASS =
  "min-w-0 flex-1 border-0 bg-transparent p-0 text-lg font-medium leading-tight [color:var(--color-fg)] placeholder:[color:var(--color-fg-hint)] focus:outline-none focus:ring-0";

export const PLAIN_CONTENT_CLASS =
  "min-h-0 w-full flex-1 resize-none overflow-y-auto border-0 bg-transparent p-0 pb-7 text-base leading-normal [color:var(--color-fg)] placeholder:[color:var(--color-fg-hint)] focus:outline-none focus:ring-0";

export const NOTE_FORM_CSS_VARS: CSSProperties = {
  "--note-form-star-active": NOTE_FORM_STYLE_CONFIG.colors.starActive,
  "--note-form-star-inactive": NOTE_FORM_STYLE_CONFIG.colors.starInactive,
  "--note-form-important-active": NOTE_FORM_STYLE_CONFIG.colors.importantActive,
  "--note-form-important-inactive":
    NOTE_FORM_STYLE_CONFIG.colors.importantInactive,
  "--note-form-save-error": NOTE_FORM_STYLE_CONFIG.colors.saveStatusError,
  "--note-form-save-success": NOTE_FORM_STYLE_CONFIG.colors.saveStatusSuccess,
} as CSSProperties;

/**
 * Transient save feedback label for the bottom-right status slot.
 */
export function getSaveStatusLabel(status: NoteSaveStatus): string | null {
  switch (status) {
    case "saving":
      return "Saving…";
    case "saved":
      return "Saved";
    case "error":
      return "Could not save";
    default:
      return null;
  }
}
