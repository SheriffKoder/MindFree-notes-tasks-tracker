/**
 * @file shared/month-navigator/index.ts
 * Public exports for the month navigator shared module.
 */

export {
  useMonthNavigation,
  type UseMonthNavigationOptions,
  type UseMonthNavigationResult,
} from "@/shared/month-navigator/model/use-month-navigation";
export {
  useCanonicalDemoMonthUrl,
  type UseCanonicalDemoMonthUrlOptions,
} from "@/shared/month-navigator/model/use-canonical-demo-month-url";
export {
  getCurrentMonth,
  parseMonthParam,
  resolveDefaultMonthKey,
  type ResolveDefaultMonthOptions,
} from "@/shared/month-navigator/lib/default-month";
export {
  formatMonthLabel,
  isValidMonthKey,
  shiftMonth,
} from "@/shared/month-navigator/lib/month-key";
export {
  MonthNavigator,
  type MonthNavigatorProps,
} from "@/shared/month-navigator/ui/month-navigator";
