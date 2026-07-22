/**
 * @file shared/demo-session/ui/demo-session-provider.tsx
 * Supplies the demo-session flag to protected app client islands.
 */

"use client";

import type { ReactNode } from "react";

import {
  DemoSessionContext,
  type DemoSessionContextValue,
} from "@/shared/demo-session/model/demo-session-context";

export interface DemoSessionProviderProps {
  /** Resolved on the server from the signed-in user's email. */
  isDemoUser: boolean;
  /** Resolved on the server from `DEMO_DEFAULT_MONTH` when demo user. */
  demoDefaultMonth: string | null;
  /** Resolved on the server from `DEMO_DEFAULT_TODAY` (or month fallback) when demo user. */
  demoDefaultToday: string | null;
  children: ReactNode;
}

/**
 * Mounts demo-session context for month URL hooks and Home selectors.
 */
export function DemoSessionProvider({
  isDemoUser,
  demoDefaultMonth,
  demoDefaultToday,
  children,
}: DemoSessionProviderProps) {
  const value: DemoSessionContextValue = {
    isDemoUser,
    demoDefaultMonth,
    demoDefaultToday,
  };

  return (
    <DemoSessionContext.Provider value={value}>
      {children}
    </DemoSessionContext.Provider>
  );
}
