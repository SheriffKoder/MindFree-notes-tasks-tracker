/**
 * @file entities/payment/lib/month-key-from-date.ts
 * Derives `YYYY-MM` from a payment ISO date.
 *
 * Purpose: Map payment.date to TanStack month cache keys.
 * Used in: entities/payment/hooks/use-create-payment-mutation.ts, cache hub
 * Used for: Routing optimistic creates and hub writes to the correct month bucket.
 */

/**
 * Returns the month key for a payment date.
 *
 * @param date - `YYYY-MM-DD`
 * @returns `YYYY-MM`
 */
export function monthKeyFromPaymentDate(date: string): string {
  return date.slice(0, 7);
}
