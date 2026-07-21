/**
 * @file entities/payment/cache/index.ts
 * Segment barrel for pure Payment TanStack cache helpers + sync hub.
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
