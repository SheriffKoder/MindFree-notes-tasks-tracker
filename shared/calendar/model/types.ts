/**
 * @file shared/calendar/model/types.ts
 * Domain-agnostic calendar grid types (no entities/note imports).
 */

import type { ReactNode } from "react";

/**
 * Minimal day shape required to place a cell on the month grid.
 */
export interface InMonthDay {
  /** Day of month (1–31). */
  day: number;
  /** ISO date (`YYYY-MM-DD`). */
  date: string;
}

/**
 * One slot in the 6×7 month grid.
 */
export type CalendarGridCell<TDay extends InMonthDay = InMonthDay> =
  | { kind: "in-month"; day: TDay }
  | { kind: "padding"; day: number; date: string };

/**
 * Context passed to `renderCell` — resolved once per grid render in `MonthCalendar`.
 */
export interface CalendarCellRenderContext {
  /** Whether this in-month day is today in local time. */
  isToday: boolean;
}

/** Viewport point forwarded with calendar day hover callbacks. */
export interface CalendarDayHoverPoint {
  x: number;
  y: number;
}

/**
 * Props for the reusable month calendar grid.
 */
export interface MonthCalendarProps<TDay extends InMonthDay> {
  /** URL month key (`YYYY-MM`) — drives padding cells. */
  month: string;
  /** In-month days prepared by the caller (typically 28–31 entries). */
  calendarDays: TDay[];
  /** Highlighted ISO date (`YYYY-MM-DD`), when set. */
  selectedDate?: string;
  /** Fired when an in-month cell is activated. */
  onDaySelect: (date: string) => void;
  /** Caller-supplied body for each in-month cell. */
  renderCell: (day: TDay, context: CalendarCellRenderContext) => ReactNode;
  /**
   * Optional pre-resolved today (`YYYY-MM-DD`).
   * When omitted, `MonthCalendar` resolves local today once per render.
   */
  todayIso?: string;
  /** Optional wrapper class name. */
  className?: string;
  /**
   * Desktop hover start on an in-month day (fine pointer only).
   * Pane decides whether the day has content before writing the hover store.
   */
  onDayHoverStart?: (date: string, point: CalendarDayHoverPoint) => void;
  /** Desktop pointer move while over an in-month day (throttled via rAF). */
  onDayHoverMove?: (date: string, point: CalendarDayHoverPoint) => void;
  /** Desktop pointer leave from an in-month day. */
  onDayHoverEnd?: (date: string) => void;
}
