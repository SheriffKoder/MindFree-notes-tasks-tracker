/**
 * @file shared/lib/today/use-local-today-iso-date.ts
 * Client hook — local calendar day that updates when the tab becomes active again.
 */

"use client";

import { useSyncExternalStore } from "react";

import {
  getLiveTodayServerSnapshot,
  getLiveTodaySnapshot,
  subscribeLiveToday,
} from "@/shared/lib/today/live-today-store";

/**
 * Wall-clock `YYYY-MM-DD` that refreshes on visibility/focus after midnight.
 *
 * Prefer {@link useTodayIsoDate} from `shared/demo-session` for app surfaces so
 * demo users keep their fixed viewing day. Use this hook only when you need the
 * real local day with no demo override (e.g. shared calendar chrome).
 */
export function useLocalTodayIsoDate(): string {
  return useSyncExternalStore(
    subscribeLiveToday,
    getLiveTodaySnapshot,
    getLiveTodayServerSnapshot,
  );
}
