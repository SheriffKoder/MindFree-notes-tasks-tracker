/**
 * @file shared/calendar/index.ts
 * Public exports for the shared calendar module (month grid UI).
 *
 * Wall-clock "today" lives in `@/shared/lib/today` — not here.
 */

export {
  buildMonthGrid,
  formatDayAriaLabel,
  formatMonthAriaLabel,
  WEEKDAY_LABELS,
} from "@/shared/calendar/lib/month-grid";
export type {
  CalendarCellRenderContext,
  CalendarGridCell,
  InMonthDay,
  MonthCalendarProps,
} from "@/shared/calendar/model/types";
export { MonthCalendar } from "@/shared/calendar/ui/month-calendar";
