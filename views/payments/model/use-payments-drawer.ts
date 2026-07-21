/**
 * @file views/payments/model/use-payments-drawer.ts
 * Payments drawer UI state — open/close and the current editor request.
 *
 * Purpose: Presentation-only controller; does not fetch or persist payments.
 * Used in: views/payments/ui/payments-client.tsx
 * Used for: openCreate / openEdit / close / setOpen for PaymentDrawer.
 *
 * Steps:
 * 1. openCreate — set request to { mode: "create" } and open.
 * 2. openEdit — set request to { mode: "edit", paymentId } and open.
 * 3. close / setOpen(false) — hide without clearing the last request.
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

  /////////////////////////////////
  // 1. Create — empty draft request
  const openCreate = useCallback(() => {
    setState({
      isOpen: true,
      request: { mode: "create" },
    });
  }, []);

  /////////////////////////////////
  // 2. Edit — target an existing payment id
  const openEdit = useCallback((paymentId: string) => {
    setState({
      isOpen: true,
      request: { mode: "edit", paymentId },
    });
  }, []);

  /////////////////////////////////
  // 3. Close — hide drawer; keep last request for remount stability
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
