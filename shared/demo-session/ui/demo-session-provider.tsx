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
  children: ReactNode;
}

/**
 * Mounts demo-session context for month URL hooks and Home selectors.
 */
export function DemoSessionProvider({
  isDemoUser,
  children,
}: DemoSessionProviderProps) {
  const value: DemoSessionContextValue = { isDemoUser };

  return (
    <DemoSessionContext.Provider value={value}>
      {children}
    </DemoSessionContext.Provider>
  );
}
