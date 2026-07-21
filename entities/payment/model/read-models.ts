/**
 * @file entities/payment/model/read-models.ts
 * Prepared payment payloads returned by page and API read use-cases.
 */

import type { Payment } from "@/entities/payment/model/types";

/** Month-scoped payments list plus total for the Payments page. */
export interface PaymentsMonthResponse {
  /** Month key (`YYYY-MM`). */
  month: string;
  /** Payments in the month, ordered by `updatedAt` descending. */
  payments: Payment[];
  /** Sum of `amount` for payments in the month. */
  totalAmount: number;
}
