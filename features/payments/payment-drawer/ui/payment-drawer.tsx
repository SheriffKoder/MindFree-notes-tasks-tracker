/**
 * @file features/payments/payment-drawer/ui/payment-drawer.tsx
 * Payment drawer island — shell, editor, and cache resolution.
 *
 * Purpose: Compose PaymentForm + last-saved footer inside AppDrawer.
 * Used in: views/payments/ui/payments-client.tsx (Home mounts later in Step 11).
 * Used for: Create/edit UI; autosave / delete live in the save orchestrator.
 *
 * Steps:
 * 1. Resolve edit target from warm month caches (null = create draft).
 * 2. Derive resetKey so the form reseeds on create ↔ edit switches.
 * 3. Wire save orchestrator (debounced create/patch + immediate delete).
 * 4. Render AppDrawer → PaymentForm → footer meta.
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
  /////////////////////////////////
  // 1. Drawer request + cache resolution
  const { isOpen, request, setOpen, openEdit } = drawer;
  const payment = useResolvedDrawerPayment(request, month);
  const [footerMeta, setFooterMeta] =
    useState<PaymentFormFooterMeta>(INITIAL_FOOTER_META);

  /////////////////////////////////
  // 2. resetKey — reseeds form when create/edit target changes
  const resetKey = useMemo(() => {
    if (request?.mode === "edit") {
      return `edit:${request.paymentId}`;
    }

    if (request?.mode === "create") {
      return "create-draft";
    }

    return "draft";
  }, [request]);

  /////////////////////////////////
  // Open-change + post-create / post-delete callbacks

  const handleOpenChange = useCallback(
    (open: boolean) => {
      // Closing — let the page clear any selection, then close
      if (!open) {
        onDismiss?.();
      }

      setOpen(open);
    },
    [onDismiss, setOpen],
  );

  // After first create, switch request to edit so further saves PATCH
  const handlePaymentCreated = useCallback(
    (paymentId: string) => {
      openEdit(paymentId);
    },
    [openEdit],
  );

  // After delete — dismiss page selection and close the drawer
  const handleDeleted = useCallback(() => {
    onDismiss?.();
    setOpen(false);
  }, [onDismiss, setOpen]);

  /////////////////////////////////
  // 3. Save orchestrator — debounced autosave + delete
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

  /////////////////////////////////
  // 4. Shell — form + last-saved footer
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
