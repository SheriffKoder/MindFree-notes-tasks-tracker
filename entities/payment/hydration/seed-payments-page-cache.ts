/**
 * @file entities/payment/hydration/seed-payments-page-cache.ts
 * Writes SSR Payments-page payloads into a QueryClient (no dehydrate).
 */

import type { QueryClient } from "@tanstack/react-query";

import { paymentsMonthQueryKey } from "@/entities/payment/client/query-keys";
import type { PaymentsPageInitialData } from "@/entities/payment/queries";

/**
 * Seeds the month payments cache from an SSR payload.
 *
 * @param queryClient - per-request server QueryClient
 * @param data - SSR payment payloads (resolved month list + total)
 */
export function seedPaymentsPageCache(
  queryClient: QueryClient,
  data: Pick<PaymentsPageInitialData, "monthPayments">,
): void {
  queryClient.setQueryData(
    paymentsMonthQueryKey(data.monthPayments.month),
    data.monthPayments,
  );
}
