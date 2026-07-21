/**
 * @file entities/payment/hydration/seed-payments-page-cache.ts
 * Writes SSR Payments-page payloads into a QueryClient (no dehydrate).
 *
 * Purpose: Seed one warm month cache from SSR read use-case output.
 * Used in: views/payments/ui/payments-hydration-seed.tsx
 * Used for: Avoiding a client refetch on first paint for the active month.
 *
 * Steps:
 * 1. Address the month key from the SSR payload.
 * 2. setQueryData with the full PaymentsMonthResponse snapshot.
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
  // 1. Address — month key from SSR payload
  queryClient.setQueryData(
    paymentsMonthQueryKey(data.monthPayments.month),
    data.monthPayments,
  );
}
