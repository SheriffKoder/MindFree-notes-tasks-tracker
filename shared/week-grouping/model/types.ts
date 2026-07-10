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
  /** Whether week sections start expanded. Default `true`. */
  defaultOpen?: boolean;
}
