/**
 * @file entities/payment/hooks/use-create-payment-mutation.ts
 * TanStack mutation for payment creation with optimistic hub updates.
 *
 * Purpose: POST a payment and keep warm month caches in sync via the hub.
 * Used in: features/payments/payment-drawer/model/use-payment-save-orchestrator.ts
 * Used for: Optimistic insert → rollback on error → swap optimistic id for server row.
 *
 * Steps (lifecycle):
 * 1. onMutate — build optimistic row, cancel queries, hub create, snapshot cache.
 * 2. mutationFn — POST /api/payments.
 * 3. onError — restore previous month cache snapshot.
 * 4. onSuccess — delete optimistic id, hub create with server payment.
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

/** Rollback context captured in onMutate. */
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
    /////////////////////////////////
    // 2. Network — create on the server
    mutationFn: async (input: CreatePaymentMutationInput) => {
      const response = await fetchPostPayment(input);
      return response.payment;
    },

    /////////////////////////////////
    // 1. Optimistic — insert temp row into the date’s month cache
    onMutate: async (input) => {
      // 1a. Build client-temp payment
      const optimistic = buildOptimisticPayment(input);
      const queryKey = paymentsMonthQueryKey(
        monthKeyFromPaymentDate(input.date),
      );

      // 1b. Stop in-flight reads so they cannot overwrite the optimistic write
      await queryClient.cancelQueries({ queryKey });

      // 1c. Snapshot for rollback
      const previousData =
        queryClient.getQueryData<PaymentsMonthResponse>(queryKey);

      // 1d. Apply via hub
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

    /////////////////////////////////
    // 3. Error — restore the month snapshot
    onError: (_error, _variables, context) => {
      if (!context) {
        return;
      }

      queryClient.setQueryData(context.queryKey, context.previousData);
    },

    /////////////////////////////////
    // 4. Success — swap optimistic id for the real server row
    onSuccess: (serverPayment, _variables, context) => {
      // 4a. Drop the temp id if we inserted one
      if (context?.optimisticId) {
        synchronizePaymentCaches(queryClient, {
          type: "delete",
          payment: { ...serverPayment, id: context.optimisticId },
        });
      }

      // 4b. Insert the authoritative server payment
      synchronizePaymentCaches(queryClient, {
        type: "create",
        payment: serverPayment,
      });
    },
  });
}
