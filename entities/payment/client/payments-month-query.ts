/**
 * @file entities/payment/client/payments-month-query.ts
 * Client read cache for month payments — fetcher + query options.
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
