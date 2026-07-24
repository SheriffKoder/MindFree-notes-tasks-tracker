/**
 * @file features/auth/session-expiry/ui/auth-session-sync.tsx
 * Root client island — reconciles URL with Supabase session on cross-tab changes.
 *
 * Purpose: One listener for SIGNED_IN / SIGNED_OUT (not INITIAL_SESSION), plus
 *          visibility/focus checks so background tabs reconcile when the user returns.
 * Used in: app/layout.tsx
 */

"use client";

import { useEffect } from "react";

import { reconcileAuthNavigation } from "@/shared/lib/auth/reconcile-auth-navigation";
import { createClient } from "@/shared/lib/supabase/client";
import { getQueryClient } from "@/shared/react-query";

/**
 * Applies session ↔ URL reconcile; cancels queries when leaving the app unsigned.
 */
function applySessionReconcile(hasSession: boolean, reason: string): void {
  if (!hasSession) {
    void getQueryClient()
      .cancelQueries()
      .finally(() => {
        reconcileAuthNavigation({ hasSession, reason });
      });
    return;
  }

  reconcileAuthNavigation({ hasSession, reason });
}

/**
 * Subscribes to auth state and hard-navigates when session and URL disagree.
 * Renders nothing.
 */
export function AuthSessionSync() {
  useEffect(() => {
    const supabase = createClient();

    async function syncFromSession(reason: string): Promise<void> {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      applySessionReconcile(session != null, reason);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // First paint is handled by proxy/layout — avoid INITIAL_SESSION bounce.
      if (event === "INITIAL_SESSION") {
        return;
      }

      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT") {
        return;
      }

      applySessionReconcile(session != null, event);
    });

    function handleVisibilityChange(): void {
      if (document.visibilityState === "visible") {
        void syncFromSession("visibilitychange");
      }
    }

    function handleWindowFocus(): void {
      void syncFromSession("focus");
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, []);

  return null;
}
