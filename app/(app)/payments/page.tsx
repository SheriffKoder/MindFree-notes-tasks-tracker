/**
 * @file app/(app)/payments/page.tsx
 * Protected payments route — sync shell; URL params and query reads stay on the client.
 *
 * Purpose: Next.js route shell composing hydration seed + client page.
 * Used in: App Router protected `(app)` layout tree
 * Used for: Parallel SSR cache seeding and client Payments UI without route Suspense flash.
 *
 * Steps:
 * 1. Render PaymentsHydrationSeed inside Suspense (non-blocking).
 * 2. Render PaymentsClient inside Suspense for URL-driven client reads.
 */

import { Suspense } from "react";

import { PaymentsClient } from "@/views/payments/ui/payments-client";
import { PaymentsHydrationSeed } from "@/views/payments/ui/payments-hydration-seed";

/**
 * Renders the Payments route. SSR hydration seeds cache in parallel with the client shell.
 * `?month=` toggles update client state only (no route Suspense flash).
 */
export default function PaymentsRoute() {
  return (
    <>
      {/* SSR cache seed — parallel, non-blocking */}
      <Suspense fallback={null}>
        <PaymentsHydrationSeed />
      </Suspense>
      {/* Client shell — month URL state + list + drawer */}
      <Suspense fallback={null}>
        <PaymentsClient />
      </Suspense>
    </>
  );
}
