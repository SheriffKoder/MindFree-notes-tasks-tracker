/**
 * @file features/payments/payment-drawer/model/use-resolved-drawer-payment.ts
 * Resolves the payment shown in the drawer editor from TanStack cache only.
 *
 * Purpose: Look up the edit target without a dedicated fetch.
 * Used in: features/payments/payment-drawer/ui/payment-drawer.tsx
 * Used for: Edit mode → Payment | null; create mode → always null (draft).
 *
 * Steps:
 * 1. Subscribe to the page month query so cache writes re-render the drawer.
 * 2. If request is not edit — return null (create draft).
 * 3. findPaymentInCache across all warm month caches by paymentId.
 */

"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import type { Payment } from "@/entities/payment";
import {
  findPaymentInCache,
  usePaymentsMonthQuery,
} from "@/entities/payment/client";
import type { PaymentEditorRequest } from "@/features/payments/payment-drawer/model/types";

/**
 * Looks up the editor payment for the current drawer context.
 *
 * `month` keeps this hook subscribed to at least one payments query so cache
 * writes re-render the drawer after create/patch/delete.
 */
export function useResolvedDrawerPayment(
  request: PaymentEditorRequest | null,
  month: string,
): Payment | null {
  /////////////////////////////////
  // 1. Subscribe to page month cache (drives re-resolve after hub writes)
  const queryClient = useQueryClient();
  const { data } = usePaymentsMonthQuery(month);

  return useMemo(() => {
    /////////////////////////////////
    // 2. Create / closed — no row to bind
    if (request?.mode !== "edit") {
      return null;
    }

    /////////////////////////////////
    // 3. Edit — search all warm month caches by id
    return findPaymentInCache(queryClient, request.paymentId);
  }, [data, queryClient, request]);
}
