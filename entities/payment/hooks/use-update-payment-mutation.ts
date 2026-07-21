/**
 * @file entities/payment/hooks/use-update-payment-mutation.ts
 * TanStack mutation for payment PATCH with optimistic hub updates.
 *
 * Purpose: PATCH a payment and keep warm month caches in sync via the hub.
 * Used in: features/payments/payment-drawer/model/use-payment-save-orchestrator.ts
 * Used for: Optimistic merge → rollback all warm months → newer-wins server apply.
 *
 * Steps (lifecycle):
 * 1. onMutate — mark pending (echo skip), snapshot all warm months, hub update.
 * 2. mutationFn — PATCH /api/payments/:id.
 * 3. onError — restore every warm-month snapshot.
 * 4. onSuccess — hub update only when server row is newer than cache.
 * 5. onSettled — clear pending flag.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  findPaymentInCache,
  isRemotePaymentNewer,
  mergePatchIntoPayment,
  synchronizePaymentCaches,
} from "@/entities/payment/cache";
import { fetchPatchPayment } from "@/entities/payment/client/patch-payment";
import { paymentsQueryKeyPrefix } from "@/entities/payment/client/query-keys";
import {
  clearPaymentMutationPending,
  markPaymentMutationPending,
} from "@/entities/payment/hooks/payment-mutation-pending";
import type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
import type { Payment } from "@/entities/payment/model/types";
import type { UpdatePaymentBody } from "@/entities/payment/schema";

export interface UpdatePaymentMutationInput {
  /** Existing payment row being edited. */
  payment: Payment;
  /** Partial fields to send to the API. */
  patch: UpdatePaymentBody;
}

/** One warm month query snapshot for rollback. */
interface CacheSnapshot {
  queryKey: readonly unknown[];
  data: PaymentsMonthResponse | undefined;
}

interface UpdatePaymentMutationContext {
  previousSnapshots: CacheSnapshot[];
}

/**
 * PATCH payment — optimistically patches warm month caches via the hub.
 */
export function useUpdatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    /////////////////////////////////
    // 2. Network — patch on the server
    mutationFn: async ({ payment, patch }: UpdatePaymentMutationInput) => {
      const response = await fetchPatchPayment(payment.id, patch);
      return response.payment;
    },

    /////////////////////////////////
    // 1. Optimistic — merge patch into cache via hub
    onMutate: async ({ payment, patch }) => {
      // 1a. Mark pending so realtime echo can skip this id
      markPaymentMutationPending(payment.id);

      // 1b. Snapshot every warm month (date may move across months)
      const monthQueries = queryClient.getQueriesData<PaymentsMonthResponse>({
        queryKey: paymentsQueryKeyPrefix,
      });
      const previousSnapshots: CacheSnapshot[] = monthQueries.map(
        ([queryKey, data]) => ({ queryKey, data }),
      );

      // 1c. Cancel in-flight month reads
      for (const { queryKey } of previousSnapshots) {
        await queryClient.cancelQueries({ queryKey });
      }

      // 1d. Apply optimistic merge through the hub
      const optimistic = mergePatchIntoPayment(payment, patch);

      synchronizePaymentCaches(queryClient, {
        type: "update",
        previous: payment,
        next: optimistic,
      });

      return { previousSnapshots } satisfies UpdatePaymentMutationContext;
    },

    /////////////////////////////////
    // 5. Always clear pending after settle
    onSettled: (_data, _error, variables) => {
      clearPaymentMutationPending(variables.payment.id);
    },

    /////////////////////////////////
    // 3. Error — restore all warm-month snapshots
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      for (const snapshot of context.previousSnapshots) {
        queryClient.setQueryData(snapshot.queryKey, snapshot.data);
      }
    },

    /////////////////////////////////
    // 4. Success — apply server row only if newer than cache
    onSuccess: (serverPayment, { payment }) => {
      const cached = findPaymentInCache(queryClient, payment.id);

      if (!isRemotePaymentNewer(serverPayment, cached)) {
        return;
      }

      synchronizePaymentCaches(queryClient, {
        type: "update",
        previous: payment,
        next: serverPayment,
      });
    },
  });
}
