/**
 * @file entities/payment/cache/is-remote-payment-newer.ts
 * Newer-wins gate using `updatedAt`.
 */

import type { Payment } from "@/entities/payment/model/types";

/**
 * @returns whether the remote row is strictly newer than the cached copy.
 */
export function isRemotePaymentNewer(
  remote: Payment,
  cached: Payment | null | undefined,
): boolean {
  if (!cached) {
    return true;
  }

  return remote.updatedAt.localeCompare(cached.updatedAt) > 0;
}
