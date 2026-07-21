/**
 * @file entities/payment/editor/fields/payment-form-field-row.tsx
 * Label + control row — flex justify-between.
 *
 * Purpose: Shared settings-row layout for editor field controls.
 * Used in: entities/payment/editor/fields/payment-form-*-row.tsx
 * Used for: Consistent label/control alignment and inline error display.
 */

import type { ReactNode } from "react";

import { FIELD_LABEL_CLASS } from "@/entities/payment/editor/lib/form-classes";
import { cn } from "@/lib/utils";

export interface PaymentFormFieldRowProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Single settings row: label on the left, control on the right.
 */
export function PaymentFormFieldRow({
  label,
  htmlFor,
  error,
  children,
  className,
}: PaymentFormFieldRowProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* Label + control — single settings row */}
      <div className="flex flex-row items-center justify-between gap-3">
        <label className={FIELD_LABEL_CLASS} htmlFor={htmlFor}>
          {label}
        </label>
        <div className="min-w-0 shrink-0">{children}</div>
      </div>
      {error ? (
        <p className="text-caption [color:var(--color-error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
