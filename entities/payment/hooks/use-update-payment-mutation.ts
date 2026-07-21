/**
 * @file entities/payment/hooks/use-update-payment-mutation.ts
 * TanStack mutation for payment PATCH with optimistic hub updates.
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
    mutationFn: async ({ payment, patch }: UpdatePaymentMutationInput) => {
      const response = await fetchPatchPayment(payment.id, patch);
      return response.payment;
    },
    onMutate: async ({ payment, patch }) => {
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

      const optimistic = mergePatchIntoPayment(payment, patch);

      synchronizePaymentCaches(queryClient, {
        type: "update",
        previous: payment,
        next: optimistic,
      });

      return { previousSnapshots } satisfies UpdatePaymentMutationContext;
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
