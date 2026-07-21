/**
 * @file entities/payment/model/read-models.ts
 * Prepared payment payloads returned by page and API read use-cases.
 *
 * Purpose: Read-model types for month-scoped list responses.
 * Used in: entities/payment/queries/*, client fetchers, TanStack month caches
 * Used for: GET /api/payments and SSR hydration month snapshots.
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
