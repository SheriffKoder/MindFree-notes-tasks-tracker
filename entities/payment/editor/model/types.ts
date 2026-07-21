/**
 * @file entities/payment/editor/model/types.ts
 * Contracts for the payment editor form and drawer wiring.
 *
 * Purpose: Shared types between the dumb form, usePaymentForm, and the drawer.
 * Used in: entities/payment/editor/ui/payment-form.tsx, payment drawer feature
 * Used for: Form values, validation errors, save status, and drawer prop contracts.
 */

import type { Payment } from "@/entities/payment/model/types";
import type { PaymentFormSchema } from "@/entities/payment/editor/model/payment-form.schema";

/** Editable payment fields managed by the form. */
export type PaymentFormValues = PaymentFormSchema;

/** Field-level validation messages keyed by form field. */
export type PaymentFormFieldErrors = Partial<
  Record<keyof PaymentFormValues, string>
>;

/** Autosave feedback surfaced in the drawer footer. */
export type PaymentSaveStatus = "idle" | "saving" | "saved" | "error";

/** Metadata emitted with each controlled change. */
export interface PaymentFormChangeMeta {
  isDirty: boolean;
  isValid: boolean;
}

/** Footer metadata emitted for the thin last-saved footer. */
export interface PaymentFormFooterMeta {
  formattedLastEditedAt: string | null;
  saveStatus: PaymentSaveStatus;
}

export interface PaymentFormProps {
  /** Existing payment to edit, or `null` for create / empty draft. */
  payment: Payment | null;
  /**
   * Identifies the active editor context (payment id or draft slot).
   * Changing it resets local field state without reacting to cache writes.
   */
  resetKey: string;
  /** Incremented after a successful autosave to snap the dirty baseline. */
  commitKey?: number;
  /**
   * Bumped when an idle open drawer may accept a remote server revision into
   * fields (realtime sync). Does not reset on every cache write.
   */
  remoteSyncKey?: number;
  /** Called when local field state changes. No network I/O in the form. */
  onChange?: (
    values: PaymentFormValues,
    meta: PaymentFormChangeMeta,
  ) => void;
  /** Optional save feedback from the drawer island. */
  saveStatus?: PaymentSaveStatus;
  /** Receives footer metadata for the thin last-saved footer. */
  onFooterMetaChange?: (meta: PaymentFormFooterMeta) => void;
  /** Hard-delete (persisted payments only). */
  onDelete?: () => void;
  /** Optional wrapper class for drawer layouts that need `flex-1` growth. */
  className?: string;
}

export interface UsePaymentFormOptions {
  payment: Payment | null;
  resetKey: string;
  commitKey?: number;
  remoteSyncKey?: number;
  onChange?: (
    values: PaymentFormValues,
    meta: PaymentFormChangeMeta,
  ) => void;
}

export interface UsePaymentFormResult {
  values: PaymentFormValues;
  errors: PaymentFormFieldErrors;
  isDirty: boolean;
  isValid: boolean;
  formattedLastEditedAt: string | null;
  setTitle: (title: string) => void;
  setAmount: (amount: number) => void;
  setDescription: (description: string) => void;
  setDate: (date: string) => void;
  setGroup: (group: string) => void;
}
