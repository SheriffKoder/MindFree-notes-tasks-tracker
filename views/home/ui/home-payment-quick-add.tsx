/**
 * @file views/home/ui/home-payment-quick-add.tsx
 * Home quick-add control — bill icon opens the payment create drawer.
 *
 * Purpose: Let users record a payment from Home without visiting `/payments`.
 * Used in: views/home/index.tsx (Starred Notes header row)
 * Used for: openCreate → PaymentDrawer; month = current YYYY-MM for cache subscribe.
 *
 * Function Index:
 * - HomePaymentQuickAdd — drawer controller + Receipt button + PaymentDrawer
 *
 * Steps:
 * 1. Own drawer controller (create only from Home).
 * 2. Resolve current month so the drawer stays subscribed after create.
 * 3. Render icon button + PaymentDrawer island.
 */

"use client";

import { useCallback } from "react";
import { Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentMonth } from "@/entities/payment";
import { PaymentDrawer } from "@/features/payments/payment-drawer";
import { HomeQuickAddIcon } from "@/views/home/ui/home-quick-add-icon";
import { usePaymentsDrawer } from "@/views/payments/model/use-payments-drawer";

/**
 * Compact bill-icon button that opens PaymentDrawer in create mode.
 */
export function HomePaymentQuickAdd() {
  /////////////////////////////////
  // 1. Drawer — create from Home; edit after first save via orchestrator
  const drawer = usePaymentsDrawer();
  const { openCreate } = drawer;

  const handleAddPayment = useCallback(() => {
    openCreate();
  }, [openCreate]);

  /////////////////////////////////
  // 2. Month — subscribe current month so hub writes re-render the drawer
  const month = getCurrentMonth();

  /////////////////////////////////
  // 3. Icon + editor island
  return (
    <>
      <Button
        aria-label="Add payment"
        className="shrink-0"
        size="icon"
        title="Add payment"
        type="button"
        variant="ghost"
        onClick={handleAddPayment}
      >
        <HomeQuickAddIcon>
          <Receipt
            aria-hidden
            className="h-4 w-4 [color:var(--color-fg-muted)]"
          />
        </HomeQuickAddIcon>
      </Button>

      <PaymentDrawer drawer={drawer} month={month} />
    </>
  );
}
