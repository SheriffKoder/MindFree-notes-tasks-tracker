/**
 * @file entities/payment/cache/is-remote-payment-newer.ts
 * Newer-wins gate using `updatedAt`.
 *
 * Purpose: Compare remote vs cached payment revision timestamps.
 * Used in: entities/payment/cache/synchronize-payment-caches.ts
 * Used for: Skipping stale realtime or hub writes when cache is already fresher.
 */

import type { Payment } from "@/entities/payment/model/types";

/**
 * @returns whether the remote row is strictly newer than the cached copy.
 */
export function isRemotePaymentNewer(
  remote: Payment,
  cached: Payment | null | undefined,
): boolean {
  // 1. Absent cache — always accept remote
  if (!cached) {
    return true;
  }

  // 2. Compare — ISO updatedAt strings, remote wins when strictly newer
  return remote.updatedAt.localeCompare(cached.updatedAt) > 0;
}
