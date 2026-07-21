/**
 * @file entities/payment/cache/synchronize-payment-caches.ts
 * Source-agnostic TanStack cache synchronization hub for payment read models.
 *
 * Purpose: Apply one normalized payment change to warm month caches.
 * Used in: mutation hooks, realtime adapter (later), offline flush (later).
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

function removePaymentFromAllWarmMonths(
  queryClient: QueryClient,
  paymentId: string,
): void {
  const monthQueries = queryClient.getQueriesData<PaymentsMonthResponse>({
    queryKey: paymentsQueryKeyPrefix,
  });

  for (const [queryKey] of monthQueries) {
    queryClient.setQueryData<PaymentsMonthResponse>(queryKey, (current) =>
      current ? removePaymentFromMonthCache(current, paymentId) : current,
    );
  }
}

function upsertPaymentIntoWarmMonth(
  queryClient: QueryClient,
  payment: Payment,
): void {
  const queryKey = paymentsMonthQueryKey(
    monthKeyFromPaymentDate(payment.date),
  );

  queryClient.setQueryData<PaymentsMonthResponse>(queryKey, (current) =>
    current ? upsertPaymentInMonthCache(current, payment) : current,
  );
}

/**
 * Applies one normalized payment change to every warm month read model.
 */
export function synchronizePaymentCaches(
  queryClient: QueryClient,
  change: PaymentChange,
): void {
  switch (change.type) {
    case "create":
      upsertPaymentIntoWarmMonth(queryClient, change.payment);
      break;
    case "update":
      removePaymentFromAllWarmMonths(queryClient, change.next.id);
      upsertPaymentIntoWarmMonth(queryClient, change.next);
      break;
    case "delete":
      removePaymentFromAllWarmMonths(queryClient, change.payment.id);
      break;
  }
}
