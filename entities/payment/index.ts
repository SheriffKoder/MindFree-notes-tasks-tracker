/**
 * @file entities/payment/index.ts
 * Shared domain exports — types and pure helpers only.
 *
 * Server reads/writes: `entities/payment/server`
 * Client cache: `entities/payment/client` (later steps)
 */

export {
  getCurrentMonth,
  getMonthRange,
  parseMonthParam,
} from "@/entities/payment/lib/parse-month";
export type { MonthRange } from "@/entities/payment/lib/parse-month";
export type { Payment } from "@/entities/payment/model/types";
export type { PaymentsMonthResponse } from "@/entities/payment/model/read-models";
