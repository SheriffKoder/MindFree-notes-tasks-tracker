/**
 * @file entities/payment/hydration/index.ts
 * Segment barrel for payment SSR cache seeders.
 *
 * Purpose: Public export for SSR QueryClient seeding.
 * Used in: entities/payment/server.ts
 * Used for: Writing month payment snapshots during Payments page SSR.
 */

export { seedPaymentsPageCache } from "@/entities/payment/hydration/seed-payments-page-cache";
