/**
 * @file entities/payment/queries/index.ts
 * Segment barrel for payment server read use-cases.
 *
 * Purpose: Public exports for month list and SSR initial data reads.
 * Used in: entities/payment/server.ts, views/payments/ui/payments-hydration-seed.tsx
 * Used for: GET /api/payments and SSR cache seeding payloads.
 */

export { getPaymentsMonthResponse } from "@/entities/payment/queries/get-payments-month-response";
export {
  getPaymentsPageInitialData,
  type PaymentsPageInitialData,
} from "@/entities/payment/queries/get-payments-page-initial-data";
