/**
 * @file shared/demo-session/model/demo-session-context.tsx
 * Client context for the signed-in demo account flag.
 */

"use client";

import { createContext } from "react";

/**
 * Demo session value resolved once in the protected app layout.
 */
export interface DemoSessionContextValue {
  /** True when the signed-in user matches `DEMO_LOGIN_EMAIL`. */
  isDemoUser: boolean;
  /** Validated `DEMO_DEFAULT_MONTH` when demo user; otherwise null. */
  demoDefaultMonth: string | null;
  /** Validated demo "today" (`DEMO_DEFAULT_TODAY` or month fallback) when demo user. */
  demoDefaultToday: string | null;
}

/**
 * Defaults to a regular session when no provider is mounted.
 */
export const DemoSessionContext = createContext<DemoSessionContextValue>({
  isDemoUser: false,
  demoDefaultMonth: null,
  demoDefaultToday: null,
});
