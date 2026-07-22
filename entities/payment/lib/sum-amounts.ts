/**
 * @file entities/payment/lib/sum-amounts.ts
 * Cent-precision sum for payment amounts.
 *
 * Purpose: Avoid floating-point drift when totaling month amounts.
 * Used in: entities/payment/queries/get-payments-month-response.ts
 * Used for: Month header total in API responses and TanStack month caches.
 */

/**
 * Sums payment amounts with cent-precision rounding.
 *
 * @param amounts - payment amounts in major currency units
 * @returns total rounded to 2 decimal places
 */
export function sumAmounts(amounts: number[]): number {
  const cents = amounts.reduce(
    (sum, amount) => sum + Math.round(amount * 100),
    0,
  );

  return cents / 100;
}
