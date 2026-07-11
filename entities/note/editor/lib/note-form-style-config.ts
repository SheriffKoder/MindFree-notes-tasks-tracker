/**
 * @file entities/note/editor/lib/note-form-style-config.ts
 * Editable style tokens for the note editor form.
 */

/**
 * Centralized colors for note editor toggles and plain fields.
 */
export const NOTE_FORM_STYLE_CONFIG = {
  colors: {
    starActive: "var(--color-accent)",
    starInactive: "var(--color-fg-muted)",
    importantActive: "var(--color-cal-important)",
    importantInactive: "var(--color-fg-muted)",
    saveStatusError: "var(--color-error)",
    saveStatusSuccess: "var(--color-success)",
  },
} as const;
