/**
 * @file features/payments/payment-drawer/pre-save-orchestrator/evaluate-payment-save.ts
 * Pure create-vs-patch decision for the payment drawer.
 *
 * Purpose: Decide whether form changes should create, patch, or noop.
 * Used in: features/payments/payment-drawer/model/use-payment-save-orchestrator.ts
 * Used for: Keep save-routing rules out of the React hook (testable, side-effect free).
 *
 * Function Index:
 * - hasMeaningfulContent — title trim gate for first create
 * - evaluatePaymentSave — create | patch | noop
 *
 * Steps (evaluatePaymentSave):
 * 1. No persisted id → create when valid + titled; else noop.
 * 2. Has id → patch when dirty + valid; else noop.
 */

import type { PaymentFormValues } from "@/entities/payment/editor";
import type {
  EvaluatePaymentSaveInput,
  EvaluatePaymentSaveResult,
} from "@/features/payments/payment-drawer/pre-save-orchestrator/types";

/**
 * @returns whether the form has a title worth persisting.
 */
export function hasMeaningfulContent(values: PaymentFormValues): boolean {
  return Boolean(values.title.trim());
}

/**
 * Runs the pre-save decision: create (new + valid + titled), patch (dirty +
 * valid), or noop.
 *
 * @param input - current form values, dirty/valid meta, and optional payment
 */
export function evaluatePaymentSave(
  input: EvaluatePaymentSaveInput,
): EvaluatePaymentSaveResult {
  const { values, meta, payment } = input;
  const payload = values;

  /////////////////////////////////
  // 1. Create path — no persisted row yet
  if (!payment?.id) {
    if (meta.isValid && hasMeaningfulContent(values)) {
      return { action: "create", payload };
    }

    return { action: "noop", payload };
  }

  /////////////////////////////////
  // 2. Patch path — existing row, only when dirty + valid
  if (meta.isDirty && meta.isValid) {
    return { action: "patch", payload };
  }

  return { action: "noop", payload };
}
