/**
 * @file features/payments/payment-drawer/index.ts
 * Public exports for the Payment drawer island.
 *
 * Purpose: Feature barrel for drawer UI, save orchestrator, and types.
 * Used in: views/payments/ui/payments-client.tsx
 * Used for: Mounting PaymentDrawer with controller + save pipeline exports.
 */

export {
  PaymentDrawer,
  type PaymentDrawerProps,
} from "@/features/payments/payment-drawer/ui/payment-drawer";
export {
  PaymentDrawerFooter,
  type PaymentDrawerFooterProps,
} from "@/features/payments/payment-drawer/ui/payment-drawer-footer";
export { usePaymentSaveOrchestrator } from "@/features/payments/payment-drawer/model/use-payment-save-orchestrator";
export type {
  PaymentDrawerController,
  PaymentEditorRequest,
} from "@/features/payments/payment-drawer/model/types";
export {
  evaluatePaymentSave,
  hasMeaningfulContent,
} from "@/features/payments/payment-drawer/pre-save-orchestrator";
export type {
  EvaluatePaymentSaveInput,
  EvaluatePaymentSaveResult,
  PaymentSaveAction,
  PaymentSavePayload,
  UsePaymentSaveOrchestratorOptions,
  UsePaymentSaveOrchestratorResult,
} from "@/features/payments/payment-drawer/pre-save-orchestrator";
