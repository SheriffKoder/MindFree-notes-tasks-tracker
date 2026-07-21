/**
 * @file entities/payment/client/index.ts
 * Segment barrel for browser payment fetchers, keys, and query options.
 */

export {
  paymentsMonthQueryKey,
  paymentsQueryKeyPrefix,
} from "@/entities/payment/client/query-keys";
export {
  fetchPaymentsMonth,
  paymentsMonthQueryOptions,
} from "@/entities/payment/client/payments-month-query";
export {
  fetchPostPayment,
  type PostPaymentResponse,
} from "@/entities/payment/client/post-payment";
export {
  fetchPatchPayment,
  type PatchPaymentResponse,
} from "@/entities/payment/client/patch-payment";
export { fetchDeletePayment } from "@/entities/payment/client/delete-payment";
