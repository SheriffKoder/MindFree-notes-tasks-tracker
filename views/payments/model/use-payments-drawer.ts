/**
 * @file views/payments/model/use-payments-drawer.ts
 * Payments drawer UI state — open/close and the current editor request.
 *
 * Presentation-only: does not fetch payments or create rows.
 */

"use client";

import { useCallback, useState } from "react";

import type {
  PaymentDrawerController,
  PaymentEditorRequest,
} from "@/features/payments/payment-drawer";

/** Local drawer state owned by {@link usePaymentsDrawer}. */
export interface PaymentsDrawerState {
  isOpen: boolean;
  request: PaymentEditorRequest | null;
}

export type UsePaymentsDrawerResult = PaymentDrawerController;

const INITIAL_STATE: PaymentsDrawerState = {
  isOpen: false,
  request: null,
};

/**
 * Manages Payments drawer visibility and the active editor request.
 */
export function usePaymentsDrawer(): UsePaymentsDrawerResult {
  const [state, setState] = useState<PaymentsDrawerState>(INITIAL_STATE);

  const openCreate = useCallback(() => {
    setState({
      isOpen: true,
      request: { mode: "create" },
    });
  }, []);

  const openEdit = useCallback((paymentId: string) => {
    setState({
      isOpen: true,
      request: { mode: "edit", paymentId },
    });
  }, []);

  const close = useCallback(() => {
    setState((previous) => ({ ...previous, isOpen: false }));
  }, []);

  const setOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        close();
      }
    },
    [close],
  );

  return {
    isOpen: state.isOpen,
    request: state.request,
    openCreate,
    openEdit,
    close,
    setOpen,
  };
}
