/**
 * @file entities/payment/offline/index.ts
 * Segment barrel for payment offline queue adapters and flush → PaymentChange mapping.
 *
 * Purpose: Public exports for offline storage + flush helpers.
 * Used in: payment save orchestrator, views/payments/ui/payments-client.tsx
 * Used for: Offline create/patch/delete through the shared queue + hub.
 */

export {
  OPTIMISTIC_PAYMENT_DRAFT_ID,
  PAYMENT_OFFLINE_DRAFT_KEY,
  PAYMENT_OFFLINE_ENTITY,
  applyPaymentOfflinePending,
  buildPaymentOfflineKey,
  createPaymentsOfflineSyncAdapter,
  isOptimisticPaymentId,
  savePaymentOfflinePending,
  toPaymentOfflineWrite,
  type PaymentOfflineOperation,
  type PaymentOfflinePayload,
  type PaymentOfflinePendingInput,
} from "@/entities/payment/offline/payments-offline-storage";
export { paymentChangeFromOfflineFlush } from "@/entities/payment/offline/payment-change-from-offline";
