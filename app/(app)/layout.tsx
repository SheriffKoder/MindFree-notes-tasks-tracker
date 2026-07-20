/**
 * @file app/(app)/layout.tsx
 * Protected app route-group layout that resolves the current user and renders the shared shell.
 */

import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { AppLockGate } from "@/features/app-lock";
import {
  isAppLockUnlocked,
} from "@/features/app-lock/server";
import { ProfileThemeApplier } from "@/features/profile/apply-theme";
import { ProfilePreferencesHydrationSeed } from "@/features/profile/apply-theme/server";
import { getSecurityRow } from "@/entities/profile/server";
import { createClient } from "@/shared/lib/supabase/server";
import { AppQueryProvider } from "@/shared/react-query";
import { AppShell } from "@/views/app-shell";

/**
 * Props for the protected app layout.
 */
interface ProtectedAppLayoutProps {
  /** Route content rendered inside the authenticated shell. */
  children: ReactNode;
}

/**
 * Resolves the authenticated app shell content behind a Suspense boundary.
 *
 * @param props - route-group children for the protected app tree
 * @returns Shared authenticated shell for the protected route tree
 */
async function ProtectedAppLayoutContent({
  children,
}: ProtectedAppLayoutProps) {
  // Create the per-request server client so this layout reads the real session.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fall back to the login page if the session is missing when the shell resolves.
  if (!user) {
    redirect("/login?error=session_missing");
  }

  const [security, unlocked] = await Promise.all([
    getSecurityRow(user.id),
    isAppLockUnlocked(user.id),
  ]);

  return (
    <AppQueryProvider>
      <Suspense fallback={null}>
        <ProfilePreferencesHydrationSeed />
      </Suspense>
      <ProfileThemeApplier />
      <AppLockGate
        initialAppLockEnabled={security?.appLockEnabled ?? false}
        initialUnlocked={unlocked}
      >
        <AppShell>{children}</AppShell>
      </AppLockGate>
    </AppQueryProvider>
  );
}

/**
 * Renders the shared protected app shell for all authenticated routes.
 *
 * @param props - route-group children for the protected app tree
 * @returns Protected route layout with a session-aware loading fallback
 */
export default function ProtectedAppLayout({
  children,
}: ProtectedAppLayoutProps) {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="app-card rounded-3xl p-5">
            <p className="text-body">Restoring your protected workspace.</p>
          </div>
        </AppShell>
      }
    >
      <ProtectedAppLayoutContent>{children}</ProtectedAppLayoutContent>
    </Suspense>
  );
}
