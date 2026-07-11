/**
 * @file entities/note/editor/lib/format-last-edited.ts
 * Formats note `lastEditedAt` for the editor footer.
 */

/**
 * Human-readable last-edited label for the note editor.
 */
export function formatNoteLastEditedAt(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Edited recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
