/**
 * @file entities/payment/hooks/use-create-payment-mutation.ts
 * TanStack mutation for payment creation with optimistic hub updates.
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  buildOptimisticPayment,
  synchronizePaymentCaches,
} from "@/entities/payment/cache";
import { fetchPostPayment } from "@/entities/payment/client/post-payment";
import { paymentsMonthQueryKey } from "@/entities/payment/client/query-keys";
import { monthKeyFromPaymentDate } from "@/entities/payment/lib/month-key-from-date";
import type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
import type { CreatePaymentBody } from "@/entities/payment/schema";

export type CreatePaymentMutationInput = CreatePaymentBody;

interface CreatePaymentMutationContext {
  previousData: PaymentsMonthResponse | undefined;
  queryKey: ReturnType<typeof paymentsMonthQueryKey>;
  optimisticId: string;
}

/**
 * POST payment — optimistically inserts into the warm month cache via the hub.
 */
export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePaymentMutationInput) => {
      const response = await fetchPostPayment(input);
      return response.payment;
    },
    onMutate: async (input) => {
      const optimistic = buildOptimisticPayment(input);
      const queryKey = paymentsMonthQueryKey(
        monthKeyFromPaymentDate(input.date),
      );

      await queryClient.cancelQueries({ queryKey });

      const previousData =
        queryClient.getQueryData<PaymentsMonthResponse>(queryKey);

      synchronizePaymentCaches(queryClient, {
        type: "create",
        payment: optimistic,
      });

      return {
        previousData,
        queryKey,
        optimisticId: optimistic.id,
      } satisfies CreatePaymentMutationContext;
    },
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(context.queryKey, context.previousData);
    },
    onSuccess: (serverPayment, _variables, context) => {
      if (context?.optimisticId) {
        synchronizePaymentCaches(queryClient, {
          type: "delete",
          payment: { ...serverPayment, id: context.optimisticId },
        });
      }

      synchronizePaymentCaches(queryClient, {
        type: "create",
        payment: serverPayment,
      });
    },
  });
}
