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
  "custom-scrollbar min-h-0 w-full flex-1 resize-none overflow-y-auto border-0 bg-transparent p-0 text-base leading-normal pb-10 [color:var(--color-fg)] placeholder:[color:var(--color-fg-hint)] focus:outline-none focus:ring-0";

/** Content textarea when the last-saved label overlays the bottom-right corner. */
export const PLAIN_CONTENT_OVERLAY_CLASS = `${PLAIN_CONTENT_CLASS}`;

export const NOTE_FORM_CSS_VARS: CSSProperties = {
  "--note-form-star-active": NOTE_FORM_STYLE_CONFIG.colors.starActive,
  "--note-form-star-inactive": NOTE_FORM_STYLE_CONFIG.colors.starInactive,
  "--note-form-important-active": NOTE_FORM_STYLE_CONFIG.colors.importantActive,
  "--note-form-important-inactive":
    NOTE_FORM_STYLE_CONFIG.colors.importantInactive,
  "--note-form-save-error": NOTE_FORM_STYLE_CONFIG.colors.saveStatusError,
  "--note-form-save-success": NOTE_FORM_STYLE_CONFIG.colors.saveStatusSuccess,
} as CSSProperties;
