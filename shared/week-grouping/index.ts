/**
 * @file shared/week-grouping/index.ts
 * Public exports for the week grouping shared module.
 */

export {
  formatWeekDateLabel,
  formatWeekDateLabelWithWeekday,
  formatWeekRangeLabel,
} from "@/shared/week-grouping/lib/format-week-date-label";
export {
  groupItemsByWeekInMonth,
  resolveItemDateByKey,
  type GroupByWeekInMonthOptions,
  type GroupByWeekInMonthResult,
  type WeekInMonthGroup,
} from "@/shared/week-grouping/lib/group-by-week-in-month";
export { type WeekGroupingConfig } from "@/shared/week-grouping/model/types";
export { WeekOrganizer, type WeekOrganizerProps } from "@/shared/week-grouping/ui/week-organizer";
