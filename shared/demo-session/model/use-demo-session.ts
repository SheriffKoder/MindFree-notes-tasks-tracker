/**
 * @file shared/demo-session/model/use-demo-session.ts
 * Reads the demo-session flag from the protected app layout provider.
 */

"use client";

import { useContext, useMemo } from "react";

import { getTodayIsoDate } from "@/shared/calendar";
import { DemoSessionContext } from "@/shared/demo-session/model/demo-session-context";

/**
 * Returns whether the current client session is the shared demo account.
 */
export function useDemoSession(): boolean {
  return useContext(DemoSessionContext).isDemoUser;
}

/**
 * Demo flags for entity {@link parseMonthParam} on client URL hooks.
 */
export interface DemoMonthParseOptions {
  isDemoUser?: boolean;
  demoDefaultMonth?: string | null;
}

/**
 * Returns demo-month parse options when the signed-in user is the demo account.
 */
export function useDemoMonthParseOptions(): DemoMonthParseOptions {
  const { isDemoUser, demoDefaultMonth } = useContext(DemoSessionContext);

  return useMemo(() => {
    if (!isDemoUser) {
      return {};
    }

    return {
      isDemoUser: true,
      demoDefaultMonth,
    };
  }, [demoDefaultMonth, isDemoUser]);
}

/**
 * Returns the ISO date Home Today / quick-record treat as "today".
 *
 * Demo users get `DEMO_DEFAULT_TODAY` (or the demo-month mid-month fallback) so
 * reads and writes stay inside the seeded month bucket. Regular users get the
 * real local calendar day.
 */
export function useTodayIsoDate(): string {
  const { isDemoUser, demoDefaultToday } = useContext(DemoSessionContext);

  return useMemo(() => {
    if (isDemoUser && demoDefaultToday) {
      return demoDefaultToday;
    }

    return getTodayIsoDate();
  }, [demoDefaultToday, isDemoUser]);
}
