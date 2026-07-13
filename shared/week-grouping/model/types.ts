/**
 * @file shared/week-grouping/model/types.ts
 * Configuration for enabling week-grouped list layout.
 */

/**
 * Props passed from a list host (e.g. `CardGridMobile`) to enable week grouping.
 */
export interface WeekGroupingConfig {
  /** Month key (`YYYY-MM`) used for week boundaries. */
  month: string;
  /** Item property key holding the ISO date (`YYYY-MM-DD`), e.g. `"date"`. */
  dateKey: string;
  /**
   * Whether week sections start expanded.
   * Use `'current-week'` to open only the week that contains today.
   * @default true
   */
  defaultOpen?: boolean | "current-week";
  /** When `true`, renders every week in the month, including weeks with no items. */
  includeEmptyWeeks?: boolean;
  /** Copy shown when a week has no items. @default "No notes this week" */
  emptyWeekText?: string;
}
