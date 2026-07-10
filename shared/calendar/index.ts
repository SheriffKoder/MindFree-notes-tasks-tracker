/**
 * @file shared/calendar/index.ts
 * Public exports for the shared calendar module.
 */

export {
  buildMonthGrid,
  formatDayAriaLabel,
  formatMonthAriaLabel,
  WEEKDAY_LABELS,
} from "@/shared/calendar/lib/month-grid";
export { getTodayIsoDate } from "@/shared/calendar/lib/today";
export type {
  CalendarCellRenderContext,
  CalendarGridCell,
  InMonthDay,
  MonthCalendarProps,
} from "@/shared/calendar/model/types";
export { MonthCalendar } from "@/shared/calendar/ui/month-calendar";
