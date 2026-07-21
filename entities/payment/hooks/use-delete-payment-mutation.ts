/**
 * @file entities/payment/hooks/use-delete-payment-mutation.ts
 * TanStack mutation for payment DELETE (temporary invalidate; hub in Step 5).
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchDeletePayment } from "@/entities/payment/client/delete-payment";
import { paymentsQueryKeyPrefix } from "@/entities/payment/client/query-keys";
import type { Payment } from "@/entities/payment/model/types";

export interface DeletePaymentMutationInput {
  /** Existing payment row to delete. */
  payment: Payment;
}

/**
 * DELETE payment — invalidates warm payments month caches on settle.
 */
export function useDeletePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payment }: DeletePaymentMutationInput) => {
      await fetchDeletePayment(payment.id);
      return payment;
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: paymentsQueryKeyPrefix });
    },
  });
}
