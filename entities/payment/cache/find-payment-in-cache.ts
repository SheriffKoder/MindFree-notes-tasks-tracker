/**
 * @file entities/payment/cache/find-payment-in-cache.ts
 * Locates a payment across warm month TanStack caches.
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
  const monthQueries = queryClient.getQueriesData<PaymentsMonthResponse>({
    queryKey: paymentsQueryKeyPrefix,
  });

  for (const [, data] of monthQueries) {
    const match = data?.payments.find((payment) => payment.id === paymentId);

    if (match) {
      return match;
    }
  }

  return null;
}
