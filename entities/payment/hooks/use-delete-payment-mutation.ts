/**
 * @file entities/payment/hooks/use-delete-payment-mutation.ts
 * TanStack mutation for payment DELETE with optimistic hub updates.
 *
 * Purpose: DELETE a payment and keep warm month caches in sync via the hub.
 * Used in: features/payments/payment-drawer/model/use-payment-save-orchestrator.ts
 * Used for: Optimistic remove → rollback all warm months on error.
 *
 * Steps (lifecycle):
 * 1. onMutate — mark pending, snapshot warm months, hub delete.
 * 2. mutationFn — DELETE /api/payments/:id.
 * 3. onError — restore every warm-month snapshot.
 * 4. onSettled — clear pending flag.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizePaymentCaches } from "@/entities/payment/cache";
import { fetchDeletePayment } from "@/entities/payment/client/delete-payment";
import { paymentsQueryKeyPrefix } from "@/entities/payment/client/query-keys";
import {
  clearPaymentMutationPending,
  markPaymentMutationPending,
} from "@/entities/payment/hooks/payment-mutation-pending";
import type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
import type { Payment } from "@/entities/payment/model/types";

export interface DeletePaymentMutationInput {
  /** Existing payment row to delete. */
  payment: Payment;
}

/** One warm month query snapshot for rollback. */
interface CacheSnapshot {
  queryKey: readonly unknown[];
  data: PaymentsMonthResponse | undefined;
}

interface DeletePaymentMutationContext {
  previousSnapshots: CacheSnapshot[];
}

/**
 * DELETE payment — optimistically removes from warm month caches via the hub.
 */
export function useDeletePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    /////////////////////////////////
    // 2. Network — delete on the server
    mutationFn: async ({ payment }: DeletePaymentMutationInput) => {
      await fetchDeletePayment(payment.id);
      return payment;
    },

    /////////////////////////////////
    // 1. Optimistic — strip from all warm months via hub
    onMutate: async ({ payment }) => {
      // 1a. Mark pending so realtime echo can skip this id
      markPaymentMutationPending(payment.id);

      // 1b. Snapshot every warm month for rollback
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

      // 1d. Apply delete through the hub
      synchronizePaymentCaches(queryClient, {
        type: "delete",
        payment,
      });

      return { previousSnapshots } satisfies DeletePaymentMutationContext;
    },

    /////////////////////////////////
    // 4. Always clear pending after settle
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
  });
}
