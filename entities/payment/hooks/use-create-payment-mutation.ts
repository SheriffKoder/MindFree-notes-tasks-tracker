/**
 * @file entities/payment/hooks/use-create-payment-mutation.ts
 * TanStack mutation for payment creation (temporary invalidate; hub in Step 5).
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchPostPayment } from "@/entities/payment/client/post-payment";
import { paymentsQueryKeyPrefix } from "@/entities/payment/client/query-keys";
import type { CreatePaymentBody } from "@/entities/payment/schema";

export type CreatePaymentMutationInput = CreatePaymentBody;

/**
 * POST payment — invalidates warm payments month caches on settle.
 */
export function useCreatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePaymentMutationInput) => {
      const response = await fetchPostPayment(input);
      return response.payment;
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: paymentsQueryKeyPrefix });
    },
  });
}
