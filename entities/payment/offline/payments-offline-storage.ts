/**
 * @file entities/payment/offline/payments-offline-storage.ts
 * Payment form ↔ localStorage ↔ TanStack month caches ↔ API.
 *
 * Purpose: Entity adapter for the shared offline queue (create / patch / delete).
 * Used in: usePaymentSaveOrchestrator (save), payments-client (useOfflineSync).
 * Used for: Persist writes while offline, optimistic hub apply, flush on reconnect.
 *
 * Function Index:
 * - buildPaymentOfflineKey — one slot per payment resource (last-win)
 * - toPaymentOfflineWrite — orchestrator input → OfflineWrite
 * - applyPaymentOfflinePending — optimistic hub patch
 * - savePaymentOfflinePending — persist + apply
 * - createPaymentsOfflineSyncAdapter — merge + flush for useOfflineSync
 *
 * Keys:
 * - create draft → `payment:draft` (stable optimistic id)
 * - patch / delete → `payment:{id}`
 */

import type { QueryClient } from "@tanstack/react-query";

import {
  buildOptimisticPayment,
  findPaymentInCache,
  mergePatchIntoPayment,
  synchronizePaymentCaches,
} from "@/entities/payment/cache";
import { fetchDeletePayment } from "@/entities/payment/client/delete-payment";
import { fetchPatchPayment } from "@/entities/payment/client/patch-payment";
import { fetchPostPayment } from "@/entities/payment/client/post-payment";
import type { PaymentFormValues } from "@/entities/payment/editor";
import type { Payment } from "@/entities/payment/model/types";
import type { OfflineEntityAdapter, OfflineWrite } from "@/shared/offline-queue";
import {
  removeOfflineWrite,
  saveOfflineWrite,
} from "@/shared/offline-queue";

import { paymentChangeFromOfflineFlush } from "./payment-change-from-offline";

/** Shared-queue entity name for payment writes. */
export const PAYMENT_OFFLINE_ENTITY = "payment";

/** localStorage key for an unsynced create draft (last-win). */
export const PAYMENT_OFFLINE_DRAFT_KEY = "payment:draft";

/** Stable client id for offline-created payments until flush. */
export const OPTIMISTIC_PAYMENT_DRAFT_ID = "optimistic-payment-draft";

export type PaymentOfflineOperation = "create" | "patch" | "delete";

export interface PaymentOfflinePayload {
  operation: PaymentOfflineOperation;
  paymentId: string | null;
  values: PaymentFormValues;
  savedAt: string;
}

export interface PaymentOfflinePendingInput {
  kind: PaymentOfflineOperation;
  payment?: Payment;
  values: PaymentFormValues;
}

/**
 * @returns whether the id is a client-temp offline draft (not a server uuid).
 */
export function isOptimisticPaymentId(paymentId: string): boolean {
  return paymentId.startsWith("optimistic-payment");
}

/**
 * Builds a stable storage key — one slot per payment resource (last-win).
 */
export function buildPaymentOfflineKey(
  input: PaymentOfflinePendingInput,
): string {
  switch (input.kind) {
    case "create":
      return PAYMENT_OFFLINE_DRAFT_KEY;
    case "patch":
    case "delete":
      return `payment:${input.payment?.id ?? "unknown"}`;
  }
}

/**
 * Maps a debounced orchestrator payload to a user-scoped offline write.
 */
export function toPaymentOfflineWrite(
  userId: string,
  input: PaymentOfflinePendingInput,
): OfflineWrite<PaymentOfflinePayload> {
  const savedAt = new Date().toISOString();

  return {
    userId,
    entity: PAYMENT_OFFLINE_ENTITY,
    key: buildPaymentOfflineKey(input),
    savedAt,
    payload: {
      operation: input.kind,
      paymentId: input.payment?.id ?? null,
      values: input.values,
      savedAt,
    },
  };
}

/**
 * Applies optimistic cache updates for one pending payment write.
 */
export function applyPaymentOfflinePending(
  queryClient: QueryClient,
  input: PaymentOfflinePendingInput,
): void {
  switch (input.kind) {
    /////////////////////////////////
    // Create — stable draft id so later offline edits can target the same row
    case "create": {
      const optimistic = buildOptimisticPayment(
        {
          title: input.values.title,
          amount: input.values.amount,
          description: input.values.description,
          date: input.values.date,
          group: input.values.group,
        },
        { id: OPTIMISTIC_PAYMENT_DRAFT_ID },
      );

      synchronizePaymentCaches(queryClient, {
        type: "create",
        payment: optimistic,
      });
      return;
    }

    /////////////////////////////////
    // Patch — merge form into cached payment via hub
    case "patch": {
      if (!input.payment) {
        return;
      }

      const optimistic = mergePatchIntoPayment(input.payment, {
        title: input.values.title,
        amount: input.values.amount,
        description: input.values.description,
        date: input.values.date,
        group: input.values.group,
      });

      synchronizePaymentCaches(queryClient, {
        type: "update",
        previous: input.payment,
        next: optimistic,
      });
      return;
    }

    /////////////////////////////////
    // Delete — strip from warm months
    case "delete": {
      if (!input.payment) {
        return;
      }

      synchronizePaymentCaches(queryClient, {
        type: "delete",
        payment: input.payment,
      });
    }
  }
}

/**
 * Persists one pending payment write and updates the TanStack cache optimistically.
 */
export function savePaymentOfflinePending(
  userId: string,
  queryClient: QueryClient,
  input: PaymentOfflinePendingInput,
): void {
  const write = toPaymentOfflineWrite(userId, input);
  saveOfflineWrite(write);
  applyPaymentOfflinePending(queryClient, input);
}

/////////////////////////////////////////////////////////////
// Adapter helpers — merge gating + flush execution

function resolvePendingFromPayload(
  queryClient: QueryClient,
  payload: PaymentOfflinePayload,
): PaymentOfflinePendingInput | null {
  if (payload.operation === "patch" || payload.operation === "delete") {
    const payment = payload.paymentId
      ? findPaymentInCache(queryClient, payload.paymentId)
      : null;

    if (!payment) {
      return null;
    }

    return {
      kind: payload.operation,
      payment,
      values: payload.values,
    };
  }

  return {
    kind: "create",
    values: payload.values,
  };
}

function resolveCachedPaymentForPayload(
  queryClient: QueryClient,
  payload: PaymentOfflinePayload,
): Payment | null {
  if (payload.paymentId) {
    return findPaymentInCache(queryClient, payload.paymentId);
  }

  if (payload.operation === "create") {
    return findPaymentInCache(queryClient, OPTIMISTIC_PAYMENT_DRAFT_ID);
  }

  return null;
}

function shouldApplyOfflinePayload(
  queryClient: QueryClient,
  payload: PaymentOfflinePayload,
): boolean {
  if (payload.operation === "delete") {
    const cached = payload.paymentId
      ? findPaymentInCache(queryClient, payload.paymentId)
      : null;

    return cached !== null && payload.savedAt > cached.updatedAt;
  }

  const cached = resolveCachedPaymentForPayload(queryClient, payload);

  if (!cached) {
    return true;
  }

  return payload.savedAt > cached.updatedAt;
}

async function executePaymentOfflinePayload(
  payload: PaymentOfflinePayload,
): Promise<Payment | null> {
  switch (payload.operation) {
    case "create": {
      const response = await fetchPostPayment({
        title: payload.values.title,
        amount: payload.values.amount,
        description: payload.values.description,
        date: payload.values.date,
        group: payload.values.group,
      });
      return response.payment;
    }
    case "patch": {
      if (!payload.paymentId) {
        return null;
      }

      const response = await fetchPatchPayment(payload.paymentId, {
        title: payload.values.title,
        amount: payload.values.amount,
        description: payload.values.description,
        date: payload.values.date,
        group: payload.values.group,
      });
      return response.payment;
    }
    case "delete": {
      if (!payload.paymentId) {
        return null;
      }

      await fetchDeletePayment(payload.paymentId);
      return null;
    }
  }
}

/**
 * Registers the payment entity adapter for page-level merge + flush.
 */
export function createPaymentsOfflineSyncAdapter(
  queryClient: QueryClient,
): OfflineEntityAdapter {
  return {
    entity: PAYMENT_OFFLINE_ENTITY,

    merge(writes) {
      for (const write of writes) {
        const payload = write.payload as PaymentOfflinePayload;

        if (!shouldApplyOfflinePayload(queryClient, payload)) {
          continue;
        }

        const pending = resolvePendingFromPayload(queryClient, payload);

        if (pending) {
          applyPaymentOfflinePending(queryClient, pending);
        }
      }
    },

    async flush(writes) {
      for (const write of writes) {
        const payload = write.payload as PaymentOfflinePayload;

        try {
          const previous = resolveCachedPaymentForPayload(queryClient, payload);
          const serverPayment = await executePaymentOfflinePayload(payload);
          const change = paymentChangeFromOfflineFlush(queryClient, payload, {
            previous,
            serverPayment,
          });

          if (change) {
            synchronizePaymentCaches(queryClient, change);
          }

          removeOfflineWrite(write.userId, write.key);
        } catch {
          // Keep in storage until the next reconnect or focus flush.
        }
      }
    },
  };
}
