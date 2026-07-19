/**
 * @file entities/activity/editor/lib/format-last-edited.ts
 * Formats activity `updatedAt` for the editor footer.
 */

/**
 * Human-readable last-edited label for the activity config form.
 */
export function formatActivityLastEditedAt(
  value: string | null | undefined,
): string | null {
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
