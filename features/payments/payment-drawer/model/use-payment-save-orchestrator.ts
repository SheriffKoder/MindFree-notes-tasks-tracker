/**
 * @file features/payments/payment-drawer/model/use-payment-save-orchestrator.ts
 * Thin hook — refs, debounce, TanStack mutations; rules live in evaluate-payment-save.
 *
 * Purpose: Bridge dumb PaymentForm onChange events to debounced TanStack writes.
 * Used in: features/payments/payment-drawer/ui/payment-drawer.tsx
 * Used for: Autosave create/patch and immediate delete (online-only until Step 10).
 *
 * Function Index:
 * - clearDebounceTimer / markSaveSuccess / markSaveError — status helpers
 * - runPendingMutation — flush queued create or patch
 * - scheduleMutation / scheduleFromEvaluation — debounce + route actions
 * - handleChange — evaluate → schedule
 * - remove — hard-delete (not debounced)
 *
 * Steps (handleChange):
 * 1. evaluate — run pure create-vs-patch pipeline.
 * 2. Gate — skip scheduling when action is noop (clear timer if clean).
 * 3. scheduleFromEvaluation — enqueue debounced create/patch mutation.
 *
 * Delete fires immediately and is never debounced.
 * Offline persistence lands in Step 10.
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

/** Queued write waiting for the debounce window to elapse. */
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
  /////////////////////////////////
  // Wiring — mutations + save UI state
  const { mutate: createPayment } = useCreatePaymentMutation();
  const { mutate: patchPayment } = useUpdatePaymentMutation();
  const { mutate: deletePayment } = useDeletePaymentMutation();

  const [saveStatus, setSaveStatus] = useState<PaymentSaveStatus>("idle");
  const [commitKey, setCommitKey] = useState(0);

  const pendingMutationRef = useRef<PendingMutation | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savedResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always read the latest payment inside debounced flush / delete
  const paymentRef = useRef(payment);
  paymentRef.current = payment;

  /////////////////////////////////
  // Status helpers

  /** Clears the pending debounce timer if one is armed. */
  const clearDebounceTimer = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  /** Marks saved, bumps commitKey (baseline snap), then resets status after delay. */
  const markSaveSuccess = useCallback(() => {
    // 1. Surface “Saved” and snap form baseline via commitKey
    setSaveStatus("saved");
    setCommitKey((previous) => previous + 1);

    // 2. Reset footer status back to idle after a short window
    if (savedResetTimerRef.current) {
      clearTimeout(savedResetTimerRef.current);
    }

    savedResetTimerRef.current = setTimeout(() => {
      setSaveStatus("idle");
    }, SAVED_STATUS_RESET_MS);
  }, []);

  /** Surfaces a save failure in the footer. */
  const markSaveError = useCallback(() => {
    setSaveStatus("error");
  }, []);

  /////////////////////////////////
  // Session lifecycle — reset when drawer closes; clear timers on unmount

  useEffect(function resetSaveStateWhenClosed() {
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

  useEffect(function cleanupTimersOnUnmount() {
    return function clearTimers() {
      clearDebounceTimer();

      if (savedResetTimerRef.current) {
        clearTimeout(savedResetTimerRef.current);
      }
    };
  }, [clearDebounceTimer]);

  /////////////////////////////////
  // Flush — run the queued create or patch against TanStack mutations

  const runPendingMutation = useCallback(() => {
    // 1. Take ownership of the pending payload (or bail)
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

    // 2. Route by pending kind
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
              // Flip create → edit so later patches target the real id
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

        // Stale queue (drawer switched target) — abort
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

  /////////////////////////////////
  // Schedule — debounce writes; map evaluate result → pending mutation

  const scheduleMutation = useCallback(
    (mutation: PendingMutation) => {
      // 1. Replace any prior pending write with the latest snapshot
      pendingMutationRef.current = mutation;
      // 2. Restart debounce window
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
          // Cancel any armed write when evaluation says nothing to do
          pendingMutationRef.current = null;
          clearDebounceTimer();
      }
    },
    [clearDebounceTimer, scheduleMutation],
  );

  /////////////////////////////////
  // Public API — form change handler + immediate delete

  /**
   * Steps:
   * 1. evaluate — pure create/patch/noop decision.
   * 2. Gate — noop clears timer when form is clean.
   * 3. scheduleFromEvaluation — debounce create/patch.
   */
  const handleChange = useCallback(
    (values: PaymentFormValues, meta: PaymentFormChangeMeta) => {
      // 1. Decide create vs patch vs noop
      const result = evaluatePaymentSave({
        values,
        meta,
        payment: paymentRef.current,
      });

      // 2. Noop — only clear the queue when the form is clean again
      if (result.action === "noop") {
        if (!meta.isDirty) {
          pendingMutationRef.current = null;
          clearDebounceTimer();
        }

        return;
      }

      // 3. Enqueue debounced mutation
      scheduleFromEvaluation(result);
    },
    [clearDebounceTimer, scheduleFromEvaluation],
  );

  /** Hard-delete the persisted payment (immediate, not debounced). */
  const remove = useCallback(() => {
    const current = paymentRef.current;

    // 1. Guard — nothing to delete in create drafts
    if (!current?.id) {
      return;
    }

    // 2. Cancel any pending autosave so it cannot resurrect the row
    clearDebounceTimer();
    pendingMutationRef.current = null;
    setSaveStatus("saving");

    // 3. Fire delete mutation; close drawer on success
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
