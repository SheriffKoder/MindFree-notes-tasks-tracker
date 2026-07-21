/**
 * @file app/(app)/payments/page.tsx
 * Protected payments route — sync shell; URL params and query reads stay on the client.
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
      <Suspense fallback={null}>
        <PaymentsHydrationSeed />
      </Suspense>
      <Suspense fallback={null}>
        <PaymentsClient />
      </Suspense>
    </>
  );
}
