/**
 * @file entities/payment/editor/lib/format-last-edited.ts
 * Formats payment `updatedAt` for the editor footer.
 *
 * Purpose: Human-readable last-edited label from ISO timestamps.
 * Used in: entities/payment/editor/model/use-payment-form.ts
 * Used for: Idle footer text when autosave is not showing transient status.
 */

/**
 * Human-readable last-edited label for the payment editor.
 */
export function formatPaymentLastEditedAt(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  // Invalid ISO — safe fallback copy
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
