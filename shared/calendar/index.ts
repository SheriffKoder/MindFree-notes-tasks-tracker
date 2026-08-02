/**
 * @file shared/calendar/index.ts
 * Public exports for the shared calendar module (month grid UI + hover tip).
 *
 * Wall-clock "today" lives in `@/shared/lib/today` — not here.
 */

export {
  cancelScheduledClearCalendarHover,
  clearCalendarHover,
  freezeCalendarHover,
  getCalendarHoverServerSnapshot,
  getCalendarHoverSnapshot,
  moveCalendarHoverPointer,
  resolveCalendarHover,
  scheduleClearCalendarHover,
  setCalendarHoverFollowing,
  subscribeCalendarHover,
  type CalendarHoverMode,
  type CalendarHoverState,
} from "@/shared/calendar/lib/calendar-hover-store";
export { isFinePointerHover } from "@/shared/calendar/lib/is-fine-pointer-hover";
export {
  buildMonthGrid,
  formatDayAriaLabel,
  formatMonthAriaLabel,
  WEEKDAY_LABELS,
} from "@/shared/calendar/lib/month-grid";
export { resolveCalendarDateUnderPoint } from "@/shared/calendar/lib/resolve-calendar-date-under-point";
export {
  computeTooltipPosition,
  type TooltipPoint,
  type TooltipPosition,
  type TooltipPositionOptions,
  type TooltipSize,
  type TooltipViewport,
} from "@/shared/calendar/lib/tooltip-position";
export type {
  CalendarCellRenderContext,
  CalendarDayHoverPoint,
  CalendarGridCell,
  InMonthDay,
  MonthCalendarProps,
} from "@/shared/calendar/model/types";
export { useCalendarHover } from "@/shared/calendar/model/use-calendar-hover";
export {
  useMonthCalendarDayHover,
  type MonthCalendarDayHoverCallbacks,
  type MonthCalendarDayHoverHandlers,
} from "@/shared/calendar/model/use-month-calendar-day-hover";
export {
  CalendarCursorTooltip,
  type CalendarCursorTooltipProps,
} from "@/shared/calendar/ui/calendar-cursor-tooltip";
export { MonthCalendar } from "@/shared/calendar/ui/month-calendar";
