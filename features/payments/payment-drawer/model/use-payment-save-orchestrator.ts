/**
 * @file features/payments/payment-drawer/model/use-payment-save-orchestrator.ts
 * Thin hook — refs, debounce, TanStack mutations; rules live in evaluate-payment-save.
 *
 * Purpose: Bridge dumb PaymentForm onChange events to debounced TanStack writes.
 * Offline persistence lands in Step 10 — this orchestrator is online-only for now.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type {
  PaymentFormChangeMeta,
  PaymentFormValues,
  PaymentSaveStatus,
} from "@/entities/payment/editor";
import {
  useCreatePaymentMutation,
  useDeletePaymentMutation,
  useUpdatePaymentMutation,
} from "@/entities/payment/client";
import { evaluatePaymentSave } from "@/features/payments/payment-drawer/pre-save-orchestrator/evaluate-payment-save";
import type {
  EvaluatePaymentSaveResult,
  UsePaymentSaveOrchestratorOptions,
  UsePaymentSaveOrchestratorResult,
} from "@/features/payments/payment-drawer/pre-save-orchestrator/types";

const MUTATION_DEBOUNCE_MS = 600;
const SAVED_STATUS_RESET_MS = 2000;

type PendingMutation =
  | {
      kind: "create";
      values: PaymentFormValues;
    }
  | {
      kind: "patch";
      paymentId: string;
      values: PaymentFormValues;
    };

/**
 * Orchestrates drawer saves via evaluatePaymentSave — no business rules here.
 */
export function usePaymentSaveOrchestrator({
  payment,
  isOpen,
  onPaymentCreated,
  onDeleted,
}: UsePaymentSaveOrchestratorOptions): UsePaymentSaveOrchestratorResult {
  const { mutate: createPayment } = useCreatePaymentMutation();
  const { mutate: patchPayment } = useUpdatePaymentMutation();
  const { mutate: deletePayment } = useDeletePaymentMutation();

  const [saveStatus, setSaveStatus] = useState<PaymentSaveStatus>("idle");
  const [commitKey, setCommitKey] = useState(0);

  const pendingMutationRef = useRef<PendingMutation | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paymentRef = useRef(payment);
  paymentRef.current = payment;

  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const markSaveSuccess = useCallback(() => {
    setSaveStatus("saved");
    setCommitKey((previous) => previous + 1);

    if (savedResetTimerRef.current) {
      clearTimeout(savedResetTimerRef.current);
    }

    savedResetTimerRef.current = setTimeout(() => {
      setSaveStatus("idle");
    }, SAVED_STATUS_RESET_MS);
  }, []);

  const markSaveError = useCallback(() => {
    setSaveStatus("error");
  }, []);

  useEffect(() => {
    if (!isOpen) {
      clearDebounceTimer();
      pendingMutationRef.current = null;
      setSaveStatus("idle");
      setCommitKey(0);

      if (savedResetTimerRef.current) {
        clearTimeout(savedResetTimerRef.current);
        savedResetTimerRef.current = null;
      }
    }
  }, [clearDebounceTimer, isOpen]);

  useEffect(() => {
    return () => {
      clearDebounceTimer();

      if (savedResetTimerRef.current) {
        clearTimeout(savedResetTimerRef.current);
      }
    };
  }, [clearDebounceTimer]);

  const runPendingMutation = useCallback(() => {
    const pending = pendingMutationRef.current;

    if (!pending) {
      return;
    }

    pendingMutationRef.current = null;
    setSaveStatus("saving");

    const mutationOptions = {
      onSuccess: () => {
        markSaveSuccess();
      },
      onError: () => {
        markSaveError();
      },
    };

    switch (pending.kind) {
      case "create":
        createPayment(
          {
            title: pending.values.title,
            amount: pending.values.amount,
            description: pending.values.description,
            date: pending.values.date,
            group: pending.values.group,
          },
          {
            onSuccess: (serverPayment) => {
              markSaveSuccess();
              onPaymentCreated(serverPayment.id);
            },
            onError: () => {
              markSaveError();
            },
          },
        );
        return;
      case "patch": {
        const current = paymentRef.current;

        if (!current || current.id !== pending.paymentId) {
          markSaveError();
          return;
        }

        patchPayment(
          {
            payment: current,
            patch: {
              title: pending.values.title,
              amount: pending.values.amount,
              description: pending.values.description,
              date: pending.values.date,
              group: pending.values.group,
            },
          },
          mutationOptions,
        );
        return;
      }
    }
  }, [
    createPayment,
    markSaveError,
    markSaveSuccess,
    onPaymentCreated,
    patchPayment,
  ]);

  const scheduleMutation = useCallback(
    (mutation: PendingMutation) => {
      pendingMutationRef.current = mutation;
      clearDebounceTimer();
      debounceTimerRef.current = setTimeout(
        runPendingMutation,
        MUTATION_DEBOUNCE_MS,
      );
    },
    [clearDebounceTimer, runPendingMutation],
  );

  const scheduleFromEvaluation = useCallback(
    (result: EvaluatePaymentSaveResult) => {
      switch (result.action) {
        case "create":
          scheduleMutation({
            kind: "create",
            values: result.payload,
          });
          return;
        case "patch": {
          const current = paymentRef.current;

          if (!current?.id) {
            return;
          }

          scheduleMutation({
            kind: "patch",
            paymentId: current.id,
            values: result.payload,
          });
          return;
        }
        case "noop":
          pendingMutationRef.current = null;
          clearDebounceTimer();
      }
    },
    [clearDebounceTimer, scheduleMutation],
  );

  const handleChange = useCallback(
    (values: PaymentFormValues, meta: PaymentFormChangeMeta) => {
      const result = evaluatePaymentSave({
        values,
        meta,
        payment: paymentRef.current,
      });

      if (result.action === "noop") {
        if (!meta.isDirty) {
          pendingMutationRef.current = null;
          clearDebounceTimer();
        }

        return;
      }

      scheduleFromEvaluation(result);
    },
    [clearDebounceTimer, scheduleFromEvaluation],
  );

  const remove = useCallback(() => {
    const current = paymentRef.current;

    if (!current?.id) {
      return;
    }

    clearDebounceTimer();
    pendingMutationRef.current = null;
    setSaveStatus("saving");

    deletePayment(
      { payment: current },
      {
        onSuccess: () => {
          markSaveSuccess();
          onDeleted?.();
        },
        onError: () => {
          markSaveError();
        },
      },
    );
  }, [
    clearDebounceTimer,
    deletePayment,
    markSaveError,
    markSaveSuccess,
    onDeleted,
  ]);

  return {
    saveStatus,
    handleChange,
    commitKey,
    remove,
  };
}
