/**
 * @file app/(app)/profile/page.tsx
 * Protected profile route — sync shell; profile data seeds via Suspense.
 */

import { Suspense } from "react";

import {
  ProfileClient,
  ProfileHydrationSeed,
} from "@/views/profile";

/**
 * Renders the Profile route. SSR hydration seeds cache in parallel with the client shell.
 */
export default function ProfileRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <ProfileHydrationSeed />
      </Suspense>
      <Suspense fallback={null}>
        <ProfileClient />
      </Suspense>
    </>
  );
}
