/**
 * @file features/payments/payment-list-card/ui/payment-list-card.tsx
 * Payment list row: title ····· amount.
 */

"use client";

import { memo } from "react";

import type { Payment } from "@/entities/payment";
import { getPaymentCardInteractionProps } from "@/features/payments/payment-list-card/lib/card-interaction-props";
import { formatPaymentAmount } from "@/features/payments/payment-list-card/lib/format-payment-amount";
import { cn } from "@/lib/utils";

export interface PaymentListCardProps {
  payment: Payment;
  /** Opens the payment drawer when the card is clicked (Step 8). */
  onClick?: () => void;
}

/**
 * Renders one payment as a compact title/amount row.
 */
export const PaymentListCard = memo(function PaymentListCard({
  payment,
  onClick,
}: PaymentListCardProps) {
  const title = payment.title.trim() || "Untitled payment";

  return (
    <article
      aria-label={`${title}, ${formatPaymentAmount(payment.amount)}`}
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 transition-colors duration-200",
        onClick &&
          "cursor-pointer hover:border-[color-mix(in_srgb,var(--color-accent)_30%,var(--color-border))]",
      )}
      {...getPaymentCardInteractionProps(onClick)}
    >
      <p className="min-w-0 flex-1 truncate text-sm font-medium [color:var(--color-fg)]">
        {title}
      </p>
      <p className="shrink-0 text-sm tabular-nums [color:var(--color-fg)]">
        {formatPaymentAmount(payment.amount)}
      </p>
    </article>
  );
});
