/**
 * @file app/(app)/reminders/page.tsx
 * Protected reminders route — sync shell; SSR seed hydrates the cache in
 * parallel with the client shell. `?month=`/`?view=` toggles stay client-side.
 */

import { Suspense } from "react";

import { RemindersClient, RemindersHydrationSeed } from "@/views/reminders";

/**
 * Renders the Reminders route. SSR hydration seeds the definitions + records
 * caches next to the client shell so first paint needs no client round-trip.
 */
export default function RemindersRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <RemindersHydrationSeed />
      </Suspense>
      <Suspense fallback={null}>
        <RemindersClient />
      </Suspense>
    </>
  );
}
