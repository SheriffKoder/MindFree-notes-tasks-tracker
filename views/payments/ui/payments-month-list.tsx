/**
 * @file views/payments/ui/payments-month-list.tsx
 * Month payments body — total row + week-grouped list cards.
 */

"use client";

import { useCallback, useMemo } from "react";

import type { Payment, PaymentsMonthResponse } from "@/entities/payment";
import {
  formatPaymentAmount,
  PaymentListCard,
} from "@/features/payments/payment-list-card";
import { ListView } from "@/shared/list-view";
import { QueryStatePanel } from "@/shared/react-query";

export interface PaymentsMonthListProps {
  month: string;
  data: PaymentsMonthResponse | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  /** Opens edit for a payment (wired to drawer in Step 8). */
  onPaymentClick: (payment: Payment) => void;
}

function getPaymentKey(payment: Payment): string {
  return payment.id;
}

/**
 * Renders the month total and week-grouped payment rows.
 */
export function PaymentsMonthList({
  month,
  data,
  isPending,
  isError,
  error,
  onPaymentClick,
}: PaymentsMonthListProps) {
  const weekGrouping = useMemo(
    () => ({
      month,
      dateKey: "date" as const,
      defaultOpen: true,
      emptyWeekText: "No payments this week",
    }),
    [month],
  );

  const renderPayment = useCallback(
    (payment: Payment) => (
      <PaymentListCard
        payment={payment}
        onClick={() => onPaymentClick(payment)}
      />
    ),
    [onPaymentClick],
  );

  if (isError) {
    return (
      <QueryStatePanel
        message={error?.message ?? "Failed to load payments."}
        variant="error"
      />
    );
  }

  if (isPending && !data) {
    return <QueryStatePanel message="Loading payments…" />;
  }

  if (!data || data.payments.length === 0) {
    return (
      <div className="flex min-h-24 flex-col items-center justify-center">
        <p className="px-2 py-1.5 text-center text-caption [color:var(--color-fg-muted)]">
          No payments this month.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="text-sm font-medium [color:var(--color-fg)]">Total</p>
        <p className="text-sm font-semibold tabular-nums [color:var(--color-fg)]">
          {formatPaymentAmount(data.totalAmount)}
        </p>
      </div>

      <ListView
        layout="list"
        items={data.payments}
        getKey={getPaymentKey}
        renderItem={renderPayment}
        weekGrouping={weekGrouping}
      />
    </div>
  );
}
