/**
 * @file entities/payment/offline/payment-change-from-offline.ts
 * Maps flushed offline payment payloads to normalized {@link PaymentChange} values.
 *
 * Purpose: Convert one successful offline flush into a hub-ready change.
 * Used in: entities/payment/offline/payments-offline-storage.ts (adapter.flush)
 * Used for: Keep flush → synchronizePaymentCaches identical to online/realtime paths.
 *
 * Function Index:
 * - buildDeletePaymentFromPayload — fallback Payment when cache miss on delete flush
 * - paymentChangeFromOfflineFlush — delete | update | create envelope
 *
 * Steps (paymentChangeFromOfflineFlush):
 * 1. delete → hub delete (cached previous or payload fallback).
 * 2. create/patch → require serverPayment; update when previous known else create.
 */

import type { QueryClient } from "@tanstack/react-query";

import {
  findPaymentInCache,
  type PaymentChange,
} from "@/entities/payment/cache";
import type { Payment } from "@/entities/payment/model/types";

import type { PaymentOfflinePayload } from "./payments-offline-storage";

/**
 * Builds a minimal Payment from a delete payload when the cache already cleared.
 */
function buildDeletePaymentFromPayload(payload: PaymentOfflinePayload): Payment {
  return {
    id: payload.paymentId!,
    title: payload.values.title,
    amount: payload.values.amount,
    description: payload.values.description,
    date: payload.values.date,
    group: payload.values.group,
    createdAt: payload.savedAt,
    updatedAt: payload.savedAt,
  };
}

/**
 * Converts one successful offline flush into a hub-ready payment change.
 *
 * @param queryClient - TanStack client (lookup fallback for delete)
 * @param payload - stored offline write payload
 * @param options - previous cached row + server confirmation
 */
export function paymentChangeFromOfflineFlush(
  queryClient: QueryClient,
  payload: PaymentOfflinePayload,
  options: {
    previous: Payment | null;
    serverPayment: Payment | null;
  },
): PaymentChange | null {
  /////////////////////////////////
  // 1. Delete — strip by id (cache hit preferred)
  if (payload.operation === "delete") {
    if (!payload.paymentId) {
      return null;
    }

    const payment =
      options.previous ?? findPaymentInCache(queryClient, payload.paymentId);

    return {
      type: "delete",
      payment: payment ?? buildDeletePaymentFromPayload(payload),
    };
  }

  /////////////////////////////////
  // 2. Create / patch — need the server row
  if (!options.serverPayment) {
    return null;
  }

  // Prior optimistic/cached row → update (also covers optimistic→server id swap)
  if (options.previous) {
    return {
      type: "update",
      previous: options.previous,
      next: options.serverPayment,
    };
  }

  return { type: "create", payment: options.serverPayment };
}
