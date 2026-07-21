/**
 * @file views/payments/index.tsx
 * Payments page composition for the protected app route tree.
 *
 * Purpose: Public view entrypoint for Payments client + hydration seed.
 * Used in: app/(app)/payments/page.tsx
 * Used for: Thin re-exports of page UI without deep view imports.
 */

export { PaymentsClient } from "@/views/payments/ui/payments-client";
export { PaymentsHydrationSeed } from "@/views/payments/ui/payments-hydration-seed";
