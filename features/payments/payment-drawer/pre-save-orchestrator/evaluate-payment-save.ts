/**
 * @file features/payments/payment-drawer/pre-save-orchestrator/evaluate-payment-save.ts
 * Pure create-vs-patch decision for the payment drawer.
 *
 * Purpose: Decide whether form changes should create, patch, or noop.
 * Used in: features/payments/payment-drawer/model/use-payment-save-orchestrator.ts
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
 */
export function evaluatePaymentSave(
  input: EvaluatePaymentSaveInput,
): EvaluatePaymentSaveResult {
  const { values, meta, payment } = input;
  const payload = values;

  if (!payment?.id) {
    if (meta.isValid && hasMeaningfulContent(values)) {
      return { action: "create", payload };
    }

    return { action: "noop", payload };
  }

  if (meta.isDirty && meta.isValid) {
    return { action: "patch", payload };
  }

  return { action: "noop", payload };
}
