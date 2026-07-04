/**
 * @file app/(app)/layout.tsx
 * Protected app route-group layout that resolves the current user and renders the shared shell.
 */

import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

import { createClient } from "@/shared/lib/supabase/server";
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

  return <AppShell>{children}</AppShell>;
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
