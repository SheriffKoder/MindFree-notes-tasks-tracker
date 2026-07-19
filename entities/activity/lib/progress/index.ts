/**
 * @file entities/activity/lib/progress/index.ts
 * Public surface for pure Progress calculation helpers.
 *
 * Server queries compose Progress via {@link buildProgressPageData}. Internal
 * accumulators stay module-local unless a focused unit needs them.
 */

export { buildProgressPageData } from "@/entities/activity/lib/progress/build-progress-page-data";
export type { BuildProgressPageDataInput } from "@/entities/activity/lib/progress/build-progress-page-data";
export {
  buildTaskProgress,
  hasProjectableDueDay,
  type ProgressAllTimeRecordValue,
} from "@/entities/activity/lib/progress/build-task-progress";
export {
  metricsForTrackingMode,
  isCurrentMetric,
} from "@/entities/activity/lib/progress/tracking-mode-metrics";
