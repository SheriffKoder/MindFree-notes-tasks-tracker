/**
 * @file views/payments/ui/payments-client.tsx
 * Client boundary for the Payments page — layout, URL state, and query island.
 */

"use client";

import { useCallback } from "react";

import { usePaymentsMonthQuery } from "@/entities/payment/client";
import { MonthNavigator } from "@/shared/month-navigator";
import { usePaymentsUrlState } from "@/views/payments/model/use-payments-url-state";
import { PaymentsAddButton } from "@/views/payments/ui/payments-add-button";

/**
 * Renders the Payments page shell with month controls and a placeholder list.
 */
export function PaymentsClient() {
  const { month, previousMonth, nextMonth } = usePaymentsUrlState();
  const { data, isPending, isError, error } = usePaymentsMonthQuery(month);

  const handleAddPayment = useCallback(() => {
    // Drawer create lands in Step 8.
  }, []);

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
          <div className="min-h-0 flex-1 space-y-3 text-sm [color:var(--color-fg-muted)]">
            {isPending ? <p>Loading payments…</p> : null}
            {isError ? (
              <p role="alert">
                {error instanceof Error
                  ? error.message
                  : "Failed to load payments."}
              </p>
            ) : null}
            {data ? (
              <>
                <p>
                  {data.payments.length} payment
                  {data.payments.length === 1 ? "" : "s"} · total{" "}
                  {data.totalAmount}
                </p>
                <pre className="overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-xs [color:var(--color-fg)]">
                  {JSON.stringify(data.payments, null, 2)}
                </pre>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
