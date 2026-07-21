/**
 * @file entities/payment/cache/index.ts
 * Segment barrel for pure Payment TanStack cache helpers + sync hub.
 *
 * Purpose: Public exports for cache lookup, newer-wins gate, and hub sync.
 * Used in: entities/payment/client.ts, mutation hooks, drawer resolve hook
 * Used for: Cross-month lookup and coordinated month cache updates.
 */

export {
  findPaymentInCache,
} from "@/entities/payment/cache/find-payment-in-cache";
export {
  buildOptimisticPayment,
  mergePatchIntoPayment,
  removePaymentFromMonthCache,
  sortPaymentsByUpdatedAtDesc,
  upsertPaymentInMonthCache,
  withPaymentsList,
} from "@/entities/payment/cache/payment-cache-mutations";
export { isRemotePaymentNewer } from "@/entities/payment/cache/is-remote-payment-newer";
export {
  synchronizePaymentCaches,
  type PaymentChange,
} from "@/entities/payment/cache/synchronize-payment-caches";
