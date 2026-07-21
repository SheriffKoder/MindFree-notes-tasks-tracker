/**
 * @file entities/payment/editor/ui/payment-form.tsx
 * Plain payment editor — composes title, amount, date, and group fields.
 *
 * Purpose: Dumb editor shell; delegates save routing to the drawer orchestrator.
 * Used in: features/payments/payment-drawer/ui/payment-drawer.tsx
 */

"use client";

import { useEffect } from "react";

import { cn } from "@/lib/utils";
import { PaymentFormAmountRow } from "@/entities/payment/editor/fields/payment-form-amount-row";
import { PaymentFormDateRow } from "@/entities/payment/editor/fields/payment-form-date-row";
import { PaymentFormGroupRow } from "@/entities/payment/editor/fields/payment-form-group-row";
import { PaymentFormTitleRow } from "@/entities/payment/editor/fields/payment-form-title-row";
import { usePaymentForm } from "@/entities/payment/editor/model/use-payment-form";
import type { PaymentFormProps } from "@/entities/payment/editor/model/types";

/**
 * Controlled payment editor for the drawer shell.
 *
 * Layout:
 * - Title + delete + description
 * - Amount / date / group rows
 */
export function PaymentForm({
  payment,
  resetKey,
  commitKey = 0,
  remoteSyncKey = 0,
  onChange,
  saveStatus = "idle",
  onFooterMetaChange,
  onDelete,
  className,
}: PaymentFormProps) {
  const {
    values,
    errors,
    formattedLastEditedAt,
    setTitle,
    setAmount,
    setDescription,
    setDate,
    setGroup,
  } = usePaymentForm({
    payment,
    resetKey,
    commitKey,
    remoteSyncKey,
    onChange,
  });

  useEffect(() => {
    onFooterMetaChange?.({
      formattedLastEditedAt,
      saveStatus,
    });
  }, [formattedLastEditedAt, onFooterMetaChange, saveStatus]);

  return (
    <form
      className={cn("flex min-h-0 flex-1 flex-col gap-4", className)}
      noValidate
      onSubmit={(event) => event.preventDefault()}
    >
      <PaymentFormTitleRow
        errors={errors}
        values={values}
        onDelete={onDelete}
        onDescriptionChange={setDescription}
        onTitleChange={setTitle}
      />

      <div className="flex shrink-0 flex-col gap-3">
        <PaymentFormAmountRow
          amount={values.amount}
          error={errors.amount}
          onChange={setAmount}
        />
        <PaymentFormDateRow
          error={errors.date}
          value={values.date}
          onChange={setDate}
        />
        <PaymentFormGroupRow
          error={errors.group}
          group={values.group}
          onChange={setGroup}
        />
      </div>
    </form>
  );
}
