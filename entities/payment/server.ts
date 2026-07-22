/**
 * @file entities/payment/server.ts
 * Server-side payment barrel — queries and mutation use-cases.
 *
 * Purpose: Single import surface for server-only payment operations.
 * Used in: app/api/payments/*, views/payments/ui/payments-hydration-seed.tsx
 * Used for: API routes, SSR hydration, and Server Component reads without client code.
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
export { seedPaymentsPageCache } from "@/entities/payment/hydration";
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
