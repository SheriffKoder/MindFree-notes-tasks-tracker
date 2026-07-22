/**
 * @file entities/payment/client/payments-month-query.ts
 * Client read cache for month payments — fetcher + query options.
 *
 * Purpose: TanStack fetcher and queryOptions for month-scoped payments.
 * Used in: entities/payment/hooks/use-payments-month-query.ts, hydration seeders
 * Used for: Client reads, SSR prefetch options, and month cache subscriptions.
 *
 * Function Index:
 * fetchPaymentsMonth — GET /api/payments?month=YYYY-MM
 * paymentsMonthQueryOptions — queryOptions factory for hooks and SSR
 */

import { queryOptions } from "@tanstack/react-query";

import { paymentsMonthQueryKey } from "@/entities/payment/client/query-keys";
import type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";

/**
 * Fetches payments for one month from the API route.
 *
 * @param month - `YYYY-MM` month key
 * @returns month payments payload
 */
export async function fetchPaymentsMonth(
  month: string,
): Promise<PaymentsMonthResponse> {
  /////////////////////////////////
  // 1. Request — GET month payments from API route
  const params = new URLSearchParams({ month });
  const response = await fetch(`/api/payments?${params.toString()}`, {
    credentials: "same-origin",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Failed to fetch payments.");
  }

  /////////////////////////////////
  // 2. Success — month list + totalAmount payload
  return response.json() as Promise<PaymentsMonthResponse>;
}

/**
 * TanStack Query options for a payments month — used by SSR prefetch and hooks.
 *
 * @param month - `YYYY-MM` month key
 */
export function paymentsMonthQueryOptions(month: string) {
  return queryOptions({
    queryKey: paymentsMonthQueryKey(month),
    queryFn: () => fetchPaymentsMonth(month),
    retry: 1,
  });
}
