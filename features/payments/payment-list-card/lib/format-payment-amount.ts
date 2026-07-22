/**
 * @file features/payments/payment-list-card/lib/format-payment-amount.ts
 * Formats payment amounts for list display.
 *
 * Purpose: Locale-aware two-decimal amount formatting for list rows.
 * Used in: features/payments/payment-list-card/ui/payment-list-card.tsx
 * Used for: Consistent major-currency display in cards and aria labels.
 */

/**
 * Formats a payment amount for the list card (major currency units).
 *
 * @param amount - amount in major currency units
 * @returns display string (e.g. `1,234.50`)
 */
export function formatPaymentAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
