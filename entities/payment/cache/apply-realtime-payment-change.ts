/**
 * @file entities/payment/cache/apply-realtime-payment-change.ts
 * Applies Supabase realtime row events to TanStack payment month caches.
 *
 * Purpose: Keep warm month caches in sync with remote writes.
 * Used in: entities/payment/hooks/use-payments-realtime-sync.ts
 * Used for: INSERT/UPDATE/DELETE on mf_payments with updatedAt gating.
 *
 * Function Index:
 * - applyRealtimePaymentChange — map row → gates → synchronizePaymentCaches
 *
 * Steps (applyRealtimePaymentChange):
 * 1. DELETE — pending skip → warm-cache membership → hub delete.
 * 2. INSERT/UPDATE — map row → pending skip → UPDATE newer-wins → hub create/update.
 */

import { findPaymentInCache } from "@/entities/payment/cache/find-payment-in-cache";
import { isRemotePaymentNewer } from "@/entities/payment/cache/is-remote-payment-newer";
import { synchronizePaymentCaches } from "@/entities/payment/cache/synchronize-payment-caches";
import { isPaymentMutationPending } from "@/entities/payment/hooks/payment-mutation-pending";
import type { Payment, PaymentRow } from "@/entities/payment/model/types";
import { mapPaymentRow } from "@/entities/payment/transform";
import type { QueryClient } from "@tanstack/react-query";

export type RealtimePaymentChangeEvent = "INSERT" | "UPDATE" | "DELETE";

export interface ApplyRealtimePaymentChangeResult {
  applied: boolean;
  payment: Payment | null;
  event: RealtimePaymentChangeEvent;
}

/** Maps a realtime postgres_changes row payload to a domain Payment. */
function mapRealtimeRow(row: Record<string, unknown>): Payment {
  return mapPaymentRow(row as unknown as PaymentRow);
}

/**
 * Patches TanStack month caches from one realtime postgres_changes payload.
 *
 * @param queryClient - TanStack client
 * @param event - INSERT | UPDATE | DELETE
 * @param newRecord - post-change row (INSERT/UPDATE)
 * @param oldRecord - pre-change row (UPDATE/DELETE)
 */
export function applyRealtimePaymentChange(
  queryClient: QueryClient,
  event: RealtimePaymentChangeEvent,
  newRecord: Record<string, unknown> | null,
  oldRecord: Record<string, unknown> | null,
): ApplyRealtimePaymentChangeResult {
  /////////////////////////////////
  // 1. DELETE — only clear ids already present in warm caches
  if (event === "DELETE") {
    const paymentId =
      (typeof oldRecord?.id === "string" ? oldRecord.id : undefined) ??
      (typeof newRecord?.id === "string" ? newRecord.id : undefined);

    if (!paymentId) {
      return { applied: false, payment: null, event };
    }

    // Local mutator echo — skip while TanStack mutation is in flight
    if (isPaymentMutationPending(paymentId)) {
      return {
        applied: false,
        payment: findPaymentInCache(queryClient, paymentId),
        event,
      };
    }

    // Unfiltered DELETE may include other users' ids — only clear warm hits
    const cached = findPaymentInCache(queryClient, paymentId);

    if (!cached) {
      return { applied: false, payment: null, event };
    }

    synchronizePaymentCaches(queryClient, {
      type: "delete",
      payment: cached,
    });

    return { applied: true, payment: cached, event };
  }

  /////////////////////////////////
  // 2. INSERT / UPDATE — map row, gate, hub write
  if (!newRecord) {
    return { applied: false, payment: null, event };
  }

  const payment = mapRealtimeRow(newRecord);

  // Local mutator echo — skip while mutation pending
  if (isPaymentMutationPending(payment.id)) {
    return { applied: false, payment, event };
  }

  const cached = findPaymentInCache(queryClient, payment.id);

  // Stale UPDATE — cache already has a newer revision
  if (event === "UPDATE" && !isRemotePaymentNewer(payment, cached)) {
    return { applied: false, payment, event };
  }

  // Prefer cache for previous; fall back to oldRecord on UPDATE
  const previous =
    cached ??
    (oldRecord && event === "UPDATE" ? mapRealtimeRow(oldRecord) : null);

  if (event === "INSERT") {
    synchronizePaymentCaches(queryClient, { type: "create", payment });
    return { applied: true, payment, event };
  }

  if (previous) {
    synchronizePaymentCaches(queryClient, {
      type: "update",
      previous,
      next: payment,
    });
    return { applied: true, payment, event };
  }

  // UPDATE with no prior membership — treat as create into the date’s month
  synchronizePaymentCaches(queryClient, { type: "create", payment });

  return { applied: true, payment, event };
}
