/**
 * @file entities/payment/client/query-keys.ts
 * TanStack Query key factories for payment read caches.
 *
 * Purpose: Stable query keys for month caches and bulk invalidation.
 * Used in: entities/payment/client/*, cache helpers, mutation hooks
 * Used for: Addressing warm month caches and invalidating all payment queries.
 *
 * Function Index:
 * paymentsMonthQueryKey — key for one YYYY-MM month bucket
 * paymentsQueryKeyPrefix — prefix for every warm payments month cache
 */

/** Query key for month-scoped payments (`payments`, `totalAmount`). */
export function paymentsMonthQueryKey(month: string) {
  return ["payments", month] as const;
}

/** Prefix for invalidating every warm payments month cache. */
export const paymentsQueryKeyPrefix = ["payments"] as const;
