/**
 * @file views/payments/ui/payments-client.tsx
 * Client boundary for the Payments page — layout, URL state, and query island.
 *
 * Purpose: Compose month navigator, list, add button, and editor drawer.
 * Used in: views/payments/index.tsx (via PaymentsPage).
 * Used for: Wire URL month + React Query + drawer openCreate / openEdit.
 *
 * Steps:
 * 1. Read URL month and fetch that month’s payments.
 * 2. Own drawer controller (create / edit request).
 * 3. Render header → controls → week list → PaymentDrawer.
 */

"use client";

import { useCallback } from "react";

import type { Payment } from "@/entities/payment";
import { usePaymentsMonthQuery } from "@/entities/payment/client";
import { PaymentDrawer } from "@/features/payments/payment-drawer";
import { MonthNavigator } from "@/shared/month-navigator";
import { usePaymentsDrawer } from "@/views/payments/model/use-payments-drawer";
import { usePaymentsUrlState } from "@/views/payments/model/use-payments-url-state";
import { PaymentsAddButton } from "@/views/payments/ui/payments-add-button";
import { PaymentsMonthList } from "@/views/payments/ui/payments-month-list";

/**
 * Renders the Payments page shell with month controls, list, and editor drawer.
 */
export function PaymentsClient() {
  /////////////////////////////////
  // 1. URL month + month query
  const { month, previousMonth, nextMonth } = usePaymentsUrlState();
  const { data, isPending, isError, error } = usePaymentsMonthQuery(month);

  /////////////////////////////////
  // 2. Drawer controller — add → create, card → edit
  const drawer = usePaymentsDrawer();

  const handleAddPayment = useCallback(() => {
    drawer.openCreate();
  }, [drawer.openCreate]);

  const handlePaymentClick = useCallback(
    (payment: Payment) => {
      drawer.openEdit(payment.id);
    },
    [drawer.openEdit],
  );

  /////////////////////////////////
  // 3. Page composition
  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4">
      {/* Page header */}
      <section className="flex shrink-0 flex-col gap-2">
        <h2 className="text-h2">Payments</h2>
        <p className="page-header__subtitle">
          Track monthly payments by week. Click a row to edit.
        </p>
      </section>

      {/* Month switcher + add */}
      <section
        aria-label="Payments controls"
        className="flex shrink-0 flex-row items-center justify-between gap-3"
      >
        <MonthNavigator
          className="min-w-0 flex-1"
          month={month}
          onPrevious={previousMonth}
          onNext={nextMonth}
        />
        <PaymentsAddButton onClick={handleAddPayment} />
      </section>

      {/* Scrollable week-grouped list */}
      <div className="relative min-h-0 flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-10] z-10 h-8 w-full bg-gradient-to-b from-[var(--color-bg)] to-transparent"
        />
        <div className="flex h-full min-h-0 flex-col overflow-x-auto overflow-y-auto pt-4 md:pt-5">
          <div className="min-h-0 flex-1">
            <PaymentsMonthList
              month={month}
              data={data}
              isPending={isPending}
              isError={isError}
              error={error}
              onPaymentClick={handlePaymentClick}
            />
          </div>
        </div>
      </div>

      {/* Editor island */}
      <PaymentDrawer drawer={drawer} month={month} />
    </div>
  );
}
