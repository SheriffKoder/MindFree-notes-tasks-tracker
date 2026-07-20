/**
 * @file app/(app)/profile/page.tsx
 * Protected profile route — shell only; preferences hydrate in `(app)/layout`.
 */

import { Suspense } from "react";

import { ProfileClient } from "@/views/profile";

/**
 * Renders the Profile route. Theme/account data is seeded by the app layout.
 */
export default function ProfileRoute() {
  return (
    <Suspense fallback={null}>
      <ProfileClient />
    </Suspense>
  );
}
