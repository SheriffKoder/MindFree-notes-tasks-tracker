/**
 * @file entities/payment/client/query-keys.ts
 * TanStack Query key factories for payment read caches.
 */

/** Query key for month-scoped payments (`payments`, `totalAmount`). */
export function paymentsMonthQueryKey(month: string) {
  return ["payments", month] as const;
}

/** Prefix for invalidating every warm payments month cache. */
export const paymentsQueryKeyPrefix = ["payments"] as const;
