/**
 * @file features/payments/payment-drawer/pre-save-orchestrator/index.ts
 * Public exports for payment pre-save evaluation.
 *
 * Purpose: Segment barrel for create-vs-patch evaluation and orchestrator types.
 * Used in: features/payments/payment-drawer/index.ts
 * Used for: evaluatePaymentSave and save orchestrator hook contracts.
 */

export {
  evaluatePaymentSave,
  hasMeaningfulContent,
} from "@/features/payments/payment-drawer/pre-save-orchestrator/evaluate-payment-save";
export type {
  EvaluatePaymentSaveInput,
  EvaluatePaymentSaveResult,
  PaymentSaveAction,
  PaymentSavePayload,
  UsePaymentSaveOrchestratorOptions,
  UsePaymentSaveOrchestratorResult,
} from "@/features/payments/payment-drawer/pre-save-orchestrator/types";
