/**
 * @file features/payments/payment-drawer/ui/payment-drawer.tsx
 * Payment drawer island — shell, editor, and cache resolution.
 *
 * Purpose: Compose PaymentForm + last-saved footer inside AppDrawer; resolve
 * the edit target from warm month caches. Autosave / delete live in the save
 * orchestrator.
 */

"use client";

import { useCallback, useMemo, useState } from "react";

import {
  PaymentForm,
  type PaymentFormFooterMeta,
} from "@/entities/payment/editor";
import type { PaymentDrawerController } from "@/features/payments/payment-drawer/model/types";
import { usePaymentSaveOrchestrator } from "@/features/payments/payment-drawer/model/use-payment-save-orchestrator";
import { useResolvedDrawerPayment } from "@/features/payments/payment-drawer/model/use-resolved-drawer-payment";
import { PaymentDrawerFooter } from "@/features/payments/payment-drawer/ui/payment-drawer-footer";
import { AppDrawer } from "@/shared/drawer";

export interface PaymentDrawerProps {
  /** Page-level drawer open/close state and editor request. */
  drawer: PaymentDrawerController;
  /**
   * Month whose payments query keeps the drawer subscribed to cache updates
   * (usually the page URL month).
   */
  month: string;
  /** Clears page selection when the drawer is dismissed. */
  onDismiss?: () => void;
}

const INITIAL_FOOTER_META: PaymentFormFooterMeta = {
  formattedLastEditedAt: null,
  saveStatus: "idle",
};

/**
 * Composes the payment form inside `AppDrawer`.
 */
export function PaymentDrawer({
  drawer,
  month,
  onDismiss,
}: PaymentDrawerProps) {
  const { isOpen, request, setOpen, openEdit } = drawer;
  const payment = useResolvedDrawerPayment(request, month);
  const [footerMeta, setFooterMeta] =
    useState<PaymentFormFooterMeta>(INITIAL_FOOTER_META);

  const resetKey = useMemo(() => {
    if (request?.mode === "edit") {
      return `edit:${request.paymentId}`;
    }

    if (request?.mode === "create") {
      return "create-draft";
    }

    return "draft";
  }, [request]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onDismiss?.();
      }

      setOpen(open);
    },
    [onDismiss, setOpen],
  );

  const handlePaymentCreated = useCallback(
    (paymentId: string) => {
      openEdit(paymentId);
    },
    [openEdit],
  );

  const handleDeleted = useCallback(() => {
    onDismiss?.();
    setOpen(false);
  }, [onDismiss, setOpen]);

  const { saveStatus, handleChange, commitKey, remove } =
    usePaymentSaveOrchestrator({
      payment,
      isOpen,
      onPaymentCreated: handlePaymentCreated,
      onDeleted: handleDeleted,
    });

  const handleFooterMetaChange = useCallback((meta: PaymentFormFooterMeta) => {
    setFooterMeta(meta);
  }, []);

  return (
    <AppDrawer
      ariaLabel="Payment editor"
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <div className="flex min-h-full flex-col">
        <PaymentForm
          commitKey={commitKey}
          payment={payment}
          resetKey={resetKey}
          saveStatus={saveStatus}
          onChange={handleChange}
          onDelete={payment?.id ? remove : undefined}
          onFooterMetaChange={handleFooterMetaChange}
        />
        <PaymentDrawerFooter
          formattedLastEditedAt={footerMeta.formattedLastEditedAt}
          saveStatus={footerMeta.saveStatus}
        />
      </div>
    </AppDrawer>
  );
}
