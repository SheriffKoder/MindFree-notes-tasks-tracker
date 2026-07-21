/**
 * @file app/(app)/profile/page.tsx
 * Protected profile route — shell only; preferences hydrate in `(app)/layout`.
 * Demo account (`DEMO_LOGIN_EMAIL`) is redirected away.
 */

import { redirect } from "next/navigation";
import { Suspense } from "react";

import { isDemoUserEmail } from "@/shared/lib/auth/demo-login-config";
import { createClient } from "@/shared/lib/supabase/server";
import { ProfileClient } from "@/views/profile";

/**
 * Renders the Profile route. Theme/account data is seeded by the app layout.
 * Demo users cannot open Profile (shared account must not change settings).
 */
export default async function ProfileRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || isDemoUserEmail(user.email)) {
    redirect("/");
  }

  return (
    <Suspense fallback={null}>
      <ProfileClient />
    </Suspense>
  );
}
