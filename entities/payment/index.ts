/**
 * @file entities/payment/index.ts
 * Shared domain exports — types and pure helpers only.
 *
 * Purpose: Cross-layer domain types and month parsing helpers.
 * Used in: views/payments/*, features/payments/* (type-only imports)
 * Used for: Shared Payment types and month utilities without server/client code.
 *
 * Server reads/writes: `entities/payment/server`
 * Client cache: `entities/payment/client`
 */

export {
  getCurrentMonth,
  getMonthRange,
  parseMonthParam,
} from "@/entities/payment/lib/parse-month";
export type { MonthRange } from "@/entities/payment/lib/parse-month";
export type { Payment } from "@/entities/payment/model/types";
export type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
