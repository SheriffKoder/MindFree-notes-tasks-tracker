/**
 * @file entities/payment/hooks/use-update-payment-mutation.ts
 * TanStack mutation for payment PATCH (temporary invalidate; hub in Step 5).
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchPatchPayment } from "@/entities/payment/client/patch-payment";
import { paymentsQueryKeyPrefix } from "@/entities/payment/client/query-keys";
import type { Payment } from "@/entities/payment/model/types";
import type { UpdatePaymentBody } from "@/entities/payment/schema";

export interface UpdatePaymentMutationInput {
  /** Existing payment row being edited. */
  payment: Payment;
  /** Partial fields to send to the API. */
  patch: UpdatePaymentBody;
}

/**
 * PATCH payment — invalidates warm payments month caches on settle.
 */
export function useUpdatePaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ payment, patch }: UpdatePaymentMutationInput) => {
      const response = await fetchPatchPayment(payment.id, patch);
      return response.payment;
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: paymentsQueryKeyPrefix });
    },
  });
}
