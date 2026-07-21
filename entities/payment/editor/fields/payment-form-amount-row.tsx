/**
 * @file entities/payment/editor/fields/payment-form-amount-row.tsx
 * Amount field as a right-aligned numeric input.
 *
 * Purpose: Major-currency amount input for payment.amount.
 * Used in: entities/payment/editor/ui/payment-form.tsx
 * Used for: Editing payment totals shown in the month list card.
 */

"use client";

import { AMOUNT_INPUT_CLASS } from "@/entities/payment/editor/lib/form-classes";
import { PaymentFormFieldRow } from "@/entities/payment/editor/fields/payment-form-field-row";

export interface PaymentFormAmountRowProps {
  amount: number;
  error?: string;
  onChange: (amount: number) => void;
}

/**
 * Label + amount input for major currency units.
 */
export function PaymentFormAmountRow({
  amount,
  error,
  onChange,
}: PaymentFormAmountRowProps) {
  /////////////////////////////////
  // Amount input — right-aligned decimal with empty → 0 coercion
  return (
    <PaymentFormFieldRow error={error} htmlFor="payment-amount" label="Amount">
      <input
        aria-invalid={Boolean(error)}
        className={AMOUNT_INPUT_CLASS}
        id="payment-amount"
        inputMode="decimal"
        min={0}
        name="amount"
        placeholder="0.00"
        step="0.01"
        type="number"
        value={Number.isFinite(amount) ? amount : ""}
        onChange={(event) => {
          const raw = event.target.value;

          // 1. Empty — treat as zero for form validity
          if (raw === "") {
            onChange(0);
            return;
          }

          // 2. Parse — ignore non-finite keystrokes
          const next = Number(raw);

          if (Number.isFinite(next)) {
            onChange(next);
          }
        }}
      />
    </PaymentFormFieldRow>
  );
}
