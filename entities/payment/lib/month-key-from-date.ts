/**
 * @file entities/payment/lib/month-key-from-date.ts
 * Derives `YYYY-MM` from a payment ISO date.
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
