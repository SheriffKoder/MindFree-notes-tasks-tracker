/**
 * @file entities/payment/editor/model/use-payment-form.ts
 * Local field state, dirty tracking, and validation for the payment editor.
 *
 * Purpose: Own form state only — no network I/O or save routing.
 * Used in: entities/payment/editor/ui/payment-form.tsx
 * Used for: Controlled fields, dirty/valid meta, and baseline snaps after autosave.
 *
 * Function Index:
 * - emptyValues — create-draft defaults (today’s date, zero amount)
 * - paymentToFormValues — map Payment | null → form snapshot
 * - valuesAreEqual — shallow equality for dirty detection
 * - getFieldErrors — Zod issues → field error map
 * - usePaymentForm — controlled editor state machine
 *
 * Steps (usePaymentForm lifecycle):
 * 1. Seed values from the loaded payment or empty defaults.
 * 2. On resetKey / payment id change — reload fields (context switch).
 * 3. On remoteSyncKey bump — pull server revision into fields when idle.
 * 4. On commitKey bump — snap dirty baseline after successful autosave.
 * 5. Emit onChange with isDirty/isValid meta on every field update.
 */

"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { formatPaymentLastEditedAt } from "@/entities/payment/editor/lib/format-last-edited";
import { paymentFormSchema } from "@/entities/payment/editor/model/payment-form.schema";
import type {
  PaymentFormFieldErrors,
  PaymentFormValues,
  UsePaymentFormOptions,
  UsePaymentFormResult,
} from "@/entities/payment/editor/model/types";
import type { Payment } from "@/entities/payment/model/types";
import { getTodayIsoDate } from "@/shared/calendar";

/////////////////////////////////////////////////////////////
// Pure helpers — seed, compare, validate (no React).

/** Create-mode defaults: empty title, zero amount, today’s date. */
function emptyValues(): PaymentFormValues {
  return {
    title: "",
    amount: 0,
    description: "",
    date: getTodayIsoDate(),
    group: "",
  };
}

/**
 * Maps a cached payment (or null draft) into editable form values.
 *
 * @param payment - persisted row, or `null` for create
 */
function paymentToFormValues(payment: Payment | null): PaymentFormValues {
  // 1. No row yet — return create defaults
  if (!payment) {
    return emptyValues();
  }

  // 2. Copy editable fields from the domain object
  return {
    title: payment.title,
    amount: payment.amount,
    description: payment.description,
    date: payment.date,
    group: payment.group,
  };
}

/**
 * @returns whether two form snapshots are field-equal (dirty detection).
 */
function valuesAreEqual(
  left: PaymentFormValues,
  right: PaymentFormValues,
): boolean {
  return (
    left.title === right.title &&
    left.amount === right.amount &&
    left.description === right.description &&
    left.date === right.date &&
    left.group === right.group
  );
}

/**
 * Runs Zod validation and returns the first message per field.
 *
 * @param values - current form snapshot
 */
function getFieldErrors(values: PaymentFormValues): PaymentFormFieldErrors {
  // 1. Parse against the editor schema
  const result = paymentFormSchema.safeParse(values);

  if (result.success) {
    return {};
  }

  // 2. Fold issues into a Partial<field, message> map (first wins)
  const errors: PaymentFormFieldErrors = {};

  for (const issue of result.error.issues) {
    const field = issue.path[0];

    if (
      typeof field === "string" &&
      (field === "title" ||
        field === "amount" ||
        field === "description" ||
        field === "date" ||
        field === "group")
    ) {
      errors[field] ??= issue.message;
    }
  }

  return errors;
}

/////////////////////////////////////////////////////////////
// Hook — controlled editor state.

/**
 * Manages controlled payment editor state derived from an optional existing row.
 *
 * Resets fields only on `resetKey` / payment id changes — not on optimistic
 * cache updates — so autosave does not wipe in-progress typing.
 */
export function usePaymentForm({
  payment,
  resetKey,
  commitKey = 0,
  remoteSyncKey = 0,
  onChange,
}: UsePaymentFormOptions): UsePaymentFormResult {
  /////////////////////////////////
  // 1. Identity + initial seed from payment / empty draft
  const paymentKey = payment?.id ?? "draft";
  const initialValues = useMemo(
    () => paymentToFormValues(payment),
    [paymentKey, resetKey],
  );

  const [baselineValues, setBaselineValues] =
    useState<PaymentFormValues>(initialValues);
  const [values, setValues] = useState<PaymentFormValues>(initialValues);
  const [errors, setErrors] = useState<PaymentFormFieldErrors>({});

  // Keep latest snapshots for commit/remote effects without re-subscribing
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const paymentRef = useRef(payment);
  paymentRef.current = payment;

  /////////////////////////////////
  // 2. Context switch — reload fields when drawer target changes
  useEffect(function resetOnContextSwitch() {
    const nextValues = paymentToFormValues(payment);
    setBaselineValues(nextValues);
    setValues(nextValues);
    setErrors({});
  }, [paymentKey, resetKey]);

  /////////////////////////////////
  // 3. Remote sync — pull cached payment only when remoteSyncKey bumps
  useEffect(function applyRemoteSync() {
    if (remoteSyncKey === 0) {
      return;
    }

    const nextValues = paymentToFormValues(paymentRef.current);
    setBaselineValues(nextValues);
    setValues(nextValues);
    setErrors({});
  }, [remoteSyncKey]);

  /////////////////////////////////
  // 4. Successful autosave — snap baseline without overwriting inputs
  useEffect(function snapBaselineAfterCommit() {
    if (commitKey === 0) {
      return;
    }

    setBaselineValues(valuesRef.current);
  }, [commitKey]);

  /////////////////////////////////
  // 5. Derived meta — dirty, valid, last-edited label
  const isDirty = useMemo(
    () => !valuesAreEqual(values, baselineValues),
    [baselineValues, values],
  );

  const isValid = useMemo(
    () => paymentFormSchema.safeParse(values).success,
    [values],
  );

  const formattedLastEditedAt = useMemo(
    () => formatPaymentLastEditedAt(payment?.updatedAt),
    [payment?.updatedAt],
  );

  /////////////////////////////////
  // 6. Field writers — update values + field errors together
  const updateValues = useCallback((nextValues: PaymentFormValues) => {
    setValues(nextValues);
    setErrors(getFieldErrors(nextValues));
  }, []);

  useEffect(function emitChangeMeta() {
    onChange?.(values, { isDirty, isValid });
  }, [isDirty, isValid, onChange, values]);

  const setTitle = useCallback(
    (title: string) => {
      updateValues({ ...values, title });
    },
    [updateValues, values],
  );

  const setAmount = useCallback(
    (amount: number) => {
      updateValues({ ...values, amount });
    },
    [updateValues, values],
  );

  const setDescription = useCallback(
    (description: string) => {
      updateValues({ ...values, description });
    },
    [updateValues, values],
  );

  const setDate = useCallback(
    (date: string) => {
      updateValues({ ...values, date });
    },
    [updateValues, values],
  );

  const setGroup = useCallback(
    (group: string) => {
      updateValues({ ...values, group });
    },
    [updateValues, values],
  );

  return {
    values,
    errors,
    isDirty,
    isValid,
    formattedLastEditedAt,
    setTitle,
    setAmount,
    setDescription,
    setDate,
    setGroup,
  };
}
