/**
 * @file entities/payment/hooks/use-payments-month-query.ts
 * Reads month payments from the TanStack cache.
 *
 * Purpose: Client hook wrapper around paymentsMonthQueryOptions.
 * Used in: views/payments/ui/payments-client.tsx, use-resolved-drawer-payment.ts
 * Used for: Month list rendering and drawer payment re-resolution after hub writes.
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
