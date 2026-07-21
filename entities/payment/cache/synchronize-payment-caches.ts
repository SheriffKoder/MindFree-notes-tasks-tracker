/**
 * @file entities/payment/cache/synchronize-payment-caches.ts
 * Source-agnostic TanStack cache synchronization hub for payment read models.
 *
 * Purpose: Apply one normalized payment change to warm month caches.
 * Used in: mutation hooks, realtime adapter (Step 9), offline flush (Step 10).
 * Used for: Single write path so local / remote / offline stay consistent.
 *
 * Function Index:
 * - removePaymentFromAllWarmMonths — strip id from every warm month cache
 * - upsertPaymentIntoWarmMonth — insert/replace in the payment’s date month
 * - synchronizePaymentCaches — route create | update | delete
 *
 * Steps (synchronizePaymentCaches):
 * 1. create → upsert into month of payment.date (warm only).
 * 2. update → remove from all warm months, then upsert into next.date month
 *    (handles month moves when date changes).
 * 3. delete → remove from all warm months.
 */

import type { QueryClient } from "@tanstack/react-query";

import {
  removePaymentFromMonthCache,
  upsertPaymentInMonthCache,
} from "@/entities/payment/cache/payment-cache-mutations";
import {
  paymentsMonthQueryKey,
  paymentsQueryKeyPrefix,
} from "@/entities/payment/client/query-keys";
import { monthKeyFromPaymentDate } from "@/entities/payment/lib/month-key-from-date";
import type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
import type { Payment } from "@/entities/payment/model/types";

/** Normalized payment write — sources map HTTP/realtime/offline payloads here. */
export type PaymentChange =
  | { type: "create"; payment: Payment }
  | { type: "update"; previous: Payment; next: Payment }
  | { type: "delete"; payment: Payment };

/////////////////////////////////////////////////////////////
// Warm-cache primitives

/**
 * Removes a payment id from every currently warm month query.
 *
 * @param queryClient - TanStack client
 * @param paymentId - row to strip
 */
function removePaymentFromAllWarmMonths(
  queryClient: QueryClient,
  paymentId: string,
): void {
  // 1. Enumerate warm month caches under the payments prefix
  const monthQueries = queryClient.getQueriesData<PaymentsMonthResponse>({
    queryKey: paymentsQueryKeyPrefix,
  });

  // 2. Rewrite each cache entry without that id (and recompute total)
  for (const [queryKey] of monthQueries) {
    queryClient.setQueryData<PaymentsMonthResponse>(queryKey, (current) =>
      current ? removePaymentFromMonthCache(current, paymentId) : current,
    );
  }
}

/**
 * Upserts a payment into the warm cache for its payment-date month only.
 *
 * Cold months are left alone — next visit will fetch fresh.
 *
 * @param queryClient - TanStack client
 * @param payment - row to insert or replace
 */
function upsertPaymentIntoWarmMonth(
  queryClient: QueryClient,
  payment: Payment,
): void {
  // 1. Resolve YYYY-MM from payment.date
  const queryKey = paymentsMonthQueryKey(
    monthKeyFromPaymentDate(payment.date),
  );

  // 2. Upsert only if that month cache is already warm
  queryClient.setQueryData<PaymentsMonthResponse>(queryKey, (current) =>
    current ? upsertPaymentInMonthCache(current, payment) : current,
  );
}

/////////////////////////////////////////////////////////////
// Hub entrypoint

/**
 * Applies one normalized payment change to every warm month read model.
 *
 * @param queryClient - TanStack client
 * @param change - create | update | delete envelope
 */
export function synchronizePaymentCaches(
  queryClient: QueryClient,
  change: PaymentChange,
): void {
  switch (change.type) {
    /////////////////////////////////
    // 1. create — insert into the payment’s date month
    case "create":
      upsertPaymentIntoWarmMonth(queryClient, change.payment);
      break;

    /////////////////////////////////
    // 2. update — remove everywhere, then upsert into next.date month
    //    (covers same-month edits and cross-month date moves)
    case "update":
      removePaymentFromAllWarmMonths(queryClient, change.next.id);
      upsertPaymentIntoWarmMonth(queryClient, change.next);
      break;

    /////////////////////////////////
    // 3. delete — strip from every warm month
    case "delete":
      removePaymentFromAllWarmMonths(queryClient, change.payment.id);
      break;
  }
}
