/**
 * @file entities/payment/editor/model/use-payment-form.ts
 * Local field state, dirty tracking, and validation for the payment editor.
 *
 * Purpose: Own form state only — no network I/O or save routing.
 * Used in: entities/payment/editor/ui/payment-form.tsx
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

function emptyValues(): PaymentFormValues {
  return {
    title: "",
    amount: 0,
    description: "",
    date: getTodayIsoDate(),
    group: "",
  };
}

function paymentToFormValues(payment: Payment | null): PaymentFormValues {
  if (!payment) {
    return emptyValues();
  }

  return {
    title: payment.title,
    amount: payment.amount,
    description: payment.description,
    date: payment.date,
    group: payment.group,
  };
}

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

function getFieldErrors(values: PaymentFormValues): PaymentFormFieldErrors {
  const result = paymentFormSchema.safeParse(values);

  if (result.success) {
    return {};
  }

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
  const paymentKey = payment?.id ?? "draft";
  const initialValues = useMemo(
    () => paymentToFormValues(payment),
    [paymentKey, resetKey],
  );

  const [baselineValues, setBaselineValues] =
    useState<PaymentFormValues>(initialValues);
  const [values, setValues] = useState<PaymentFormValues>(initialValues);
  const [errors, setErrors] = useState<PaymentFormFieldErrors>({});

  const valuesRef = useRef(values);
  valuesRef.current = values;

  const paymentRef = useRef(payment);
  paymentRef.current = payment;

  useEffect(() => {
    const nextValues = paymentToFormValues(payment);
    setBaselineValues(nextValues);
    setValues(nextValues);
    setErrors({});
  }, [paymentKey, resetKey]);

  useEffect(() => {
    if (remoteSyncKey === 0) {
      return;
    }

    const nextValues = paymentToFormValues(paymentRef.current);
    setBaselineValues(nextValues);
    setValues(nextValues);
    setErrors({});
  }, [remoteSyncKey]);

  useEffect(() => {
    if (commitKey === 0) {
      return;
    }

    setBaselineValues(valuesRef.current);
  }, [commitKey]);

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

  const updateValues = useCallback((nextValues: PaymentFormValues) => {
    setValues(nextValues);
    setErrors(getFieldErrors(nextValues));
  }, []);

  useEffect(() => {
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
