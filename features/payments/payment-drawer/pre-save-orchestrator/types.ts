/**
 * @file features/payments/payment-drawer/pre-save-orchestrator/types.ts
 * Contracts for the payment pre-save evaluation pipeline and save orchestrator.
 *
 * Purpose: Shared types for evaluate-payment-save and usePaymentSaveOrchestrator.
 * Used in: features/payments/payment-drawer/pre-save-orchestrator/*, model/*
 * Used for: Create-vs-patch decisions, save payloads, and orchestrator hook contracts.
 */

import type {
  PaymentFormChangeMeta,
  PaymentFormValues,
  PaymentSaveStatus,
} from "@/entities/payment/editor";
import type { Payment } from "@/entities/payment/model/types";

/** Resolved save intent after the create-vs-patch decision. */
export type PaymentSaveAction = "create" | "patch" | "noop";

/** Payload passed to create/patch mutations — the editable form snapshot. */
export type PaymentSavePayload = PaymentFormValues;

export interface EvaluatePaymentSaveInput {
  values: PaymentFormValues;
  meta: PaymentFormChangeMeta;
  /** Persisted payment when editing; `null` for create drafts. */
  payment: Payment | null;
}

export interface EvaluatePaymentSaveResult {
  action: PaymentSaveAction;
  payload: PaymentSavePayload;
}

export interface UsePaymentSaveOrchestratorOptions {
  /** Persisted payment when editing; `null` for create drafts. */
  payment: Payment | null;
  /** Drawer open flag — resets save UI when a session starts. */
  isOpen: boolean;
  /** Switches create intent to edit mode after the first row exists. */
  onPaymentCreated: (paymentId: string) => void;
  /** Closes the drawer after a successful hard-delete. */
  onDeleted?: () => void;
}

export interface UsePaymentSaveOrchestratorResult {
  saveStatus: PaymentSaveStatus;
  handleChange: (
    values: PaymentFormValues,
    meta: PaymentFormChangeMeta,
  ) => void;
  /** Incremented after a successful autosave to snap the form dirty baseline. */
  commitKey: number;
  /** Hard-delete the persisted payment (immediate, not debounced). */
  remove: () => void;
}
