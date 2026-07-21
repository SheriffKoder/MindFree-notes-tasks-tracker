/**
 * @file entities/payment/cache/find-payment-in-cache.ts
 * Locates a payment across warm month TanStack caches.
 *
 * Purpose: Cross-month lookup by payment id without a dedicated fetch.
 * Used in: features/payments/payment-drawer/model/use-resolved-drawer-payment.ts
 * Used for: Binding the drawer editor to a cached row after hub writes.
 *
 * Steps:
 * 1. Collect all warm queries under the payments prefix.
 * 2. Scan each month bucket for a matching payment id.
 */

import type { QueryClient } from "@tanstack/react-query";

import { paymentsQueryKeyPrefix } from "@/entities/payment/client/query-keys";
import type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
import type { Payment } from "@/entities/payment/model/types";

/**
 * Finds a payment by id in any warm month cache.
 *
 * @param queryClient - TanStack query client
 * @param paymentId - row id
 * @returns cached payment, or `null` when absent
 */
export function findPaymentInCache(
  queryClient: QueryClient,
  paymentId: string,
): Payment | null {
  /////////////////////////////////
  // 1. Warm caches — every seeded month query under ["payments"]
  const monthQueries = queryClient.getQueriesData<PaymentsMonthResponse>({
    queryKey: paymentsQueryKeyPrefix,
  });

  /////////////////////////////////
  // 2. Scan — first id match wins
  for (const [, data] of monthQueries) {
    const match = data?.payments.find((payment) => payment.id === paymentId);

    if (match) {
      return match;
    }
  }

  return null;
}
