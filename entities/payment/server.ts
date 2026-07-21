/**
 * @file entities/payment/server.ts
 * Server-side payment barrel — repository access for route handlers (Step 2).
 *
 * Later steps add queries/, mutations/, and hydration/ and re-export here.
 */

export {
  createPayment,
  deletePaymentById,
  getAuthenticatedUserId,
  getPaymentsForMonth,
  updatePaymentById,
} from "@/entities/payment/repository";
export type {
  CreatePaymentBody,
  UpdatePaymentBody,
} from "@/entities/payment/schema";
export {
  createPaymentBodySchema,
  updatePaymentBodySchema,
} from "@/entities/payment/schema";
export type { Payment } from "@/entities/payment/model/types";
export {
  getCurrentMonth,
  getMonthRange,
  parseMonthParam,
} from "@/entities/payment/lib/parse-month";
