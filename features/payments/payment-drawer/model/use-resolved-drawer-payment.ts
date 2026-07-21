/**
 * @file features/payments/payment-drawer/model/use-resolved-drawer-payment.ts
 * Resolves the payment shown in the drawer editor from TanStack cache only.
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { findPaymentInCache } from "@/entities/payment/cache";
import type { Payment } from "@/entities/payment";
import { usePaymentsMonthQuery } from "@/entities/payment/client";
import type { PaymentEditorRequest } from "@/features/payments/payment-drawer/model/types";

/**
 * Looks up the editor payment for the current drawer context.
 *
 * Edit mode: payment by id across warm month caches.
 * Create requests return `null` (empty draft).
 *
 * `month` keeps this hook subscribed to at least one payments query so cache
 * writes re-render the drawer after create/patch/delete.
 */
export function useResolvedDrawerPayment(
  request: PaymentEditorRequest | null,
  month: string,
): Payment | null {
  const queryClient = useQueryClient();
  const { data } = usePaymentsMonthQuery(month);

  return useMemo(() => {
    if (request?.mode !== "edit") {
      return null;
    }

    return findPaymentInCache(queryClient, request.paymentId);
  }, [data, queryClient, request]);
}
