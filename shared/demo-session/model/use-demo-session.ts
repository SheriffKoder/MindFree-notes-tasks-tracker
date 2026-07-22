/**
 * @file shared/demo-session/model/use-demo-session.ts
 * Reads the demo-session flag from the protected app layout provider.
 */

"use client";

import { useContext } from "react";

import { DemoSessionContext } from "@/shared/demo-session/model/demo-session-context";

/**
 * Returns whether the current client session is the shared demo account.
 */
export function useDemoSession(): boolean {
  return useContext(DemoSessionContext).isDemoUser;
}
