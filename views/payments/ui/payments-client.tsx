/**
 * @file views/payments/ui/payments-client.tsx
 * Client boundary for the Payments page — layout, URL state, and query island.
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
  const { month, previousMonth, nextMonth } = usePaymentsUrlState();
  const { data, isPending, isError, error } = usePaymentsMonthQuery(month);
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

  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4">
      <section className="flex shrink-0 flex-col gap-2">
        <h2 className="text-h2">Payments</h2>
        <p className="page-header__subtitle">
          Track monthly payments by week. Click a row to edit.
        </p>
      </section>

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

      <PaymentDrawer drawer={drawer} month={month} />
    </div>
  );
}
