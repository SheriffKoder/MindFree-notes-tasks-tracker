/**
 * @file entities/payment/queries/index.ts
 * Segment barrel for payment server read use-cases.
 */

export { getPaymentsMonthResponse } from "@/entities/payment/queries/get-payments-month-response";
export {
  getPaymentsPageInitialData,
  type PaymentsPageInitialData,
} from "@/entities/payment/queries/get-payments-page-initial-data";
