/**
 * @file shared/calendar/model/use-calendar-hover.ts
 * Client hook — subscribe to calendar cursor-tooltip hover state.
 */

"use client";

import { useSyncExternalStore } from "react";

import {
  getCalendarHoverServerSnapshot,
  getCalendarHoverSnapshot,
  subscribeCalendarHover,
  type CalendarHoverState,
} from "@/shared/calendar/lib/calendar-hover-store";

/**
 * Current calendar hover tip state (`idle` | `following` | `frozen`).
 *
 * Prefer writing via store functions (`setCalendarHoverFollowing`, etc.) from
 * cell/pane handlers so those writers do not re-render on every pointer move.
 */
export function useCalendarHover(): CalendarHoverState {
  return useSyncExternalStore(
    subscribeCalendarHover,
    getCalendarHoverSnapshot,
    getCalendarHoverServerSnapshot,
  );
}
