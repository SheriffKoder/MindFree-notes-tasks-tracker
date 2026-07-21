/**
 * @file entities/payment/hooks/use-delete-payment-mutation.ts
 * TanStack mutation for payment DELETE with optimistic hub updates.
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
    mutationFn: async ({ payment }: DeletePaymentMutationInput) => {
      await fetchDeletePayment(payment.id);
      return payment;
    },
    onMutate: async ({ payment }) => {
      markPaymentMutationPending(payment.id);

      const monthQueries = queryClient.getQueriesData<PaymentsMonthResponse>({
        queryKey: paymentsQueryKeyPrefix,
      });
      const previousSnapshots: CacheSnapshot[] = monthQueries.map(
        ([queryKey, data]) => ({ queryKey, data }),
      );

      for (const { queryKey } of previousSnapshots) {
        await queryClient.cancelQueries({ queryKey });
      }

      synchronizePaymentCaches(queryClient, {
        type: "delete",
        payment,
      });

      return { previousSnapshots } satisfies DeletePaymentMutationContext;
    },
    onSettled: (_data, _error, variables) => {
      clearPaymentMutationPending(variables.payment.id);
    },
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
