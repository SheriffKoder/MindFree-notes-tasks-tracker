/**
 * @file entities/payment/server.ts
 * Server-side payment barrel — queries and mutation use-cases.
 *
 * Purpose: Single import surface for server-only payment operations.
 * Used in: app/api/payments/*, Server Components, hydration seeders
 */

export {
  getPaymentsMonthResponse,
  getPaymentsPageInitialData,
  type PaymentsPageInitialData,
} from "@/entities/payment/queries";
export {
  createPayment,
  deletePayment,
  updatePayment,
} from "@/entities/payment/mutations";
export { getAuthenticatedUserId } from "@/entities/payment/repository";
export type {
  CreatePaymentBody,
  UpdatePaymentBody,
} from "@/entities/payment/schema";
export {
  createPaymentBodySchema,
  updatePaymentBodySchema,
} from "@/entities/payment/schema";
export type { Payment } from "@/entities/payment/model/types";
export type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
export {
  getCurrentMonth,
  getMonthRange,
  parseMonthParam,
} from "@/entities/payment/lib/parse-month";
