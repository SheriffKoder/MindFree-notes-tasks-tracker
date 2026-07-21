/**
 * @file entities/payment/hooks/use-payments-month-query.ts
 * Reads month payments from the TanStack cache.
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { paymentsMonthQueryOptions } from "@/entities/payment/client/payments-month-query";

/**
 * Reads payments for one month from the TanStack cache.
 *
 * @param month - `YYYY-MM` month key
 */
export function usePaymentsMonthQuery(month: string) {
  return useQuery(paymentsMonthQueryOptions(month));
}
