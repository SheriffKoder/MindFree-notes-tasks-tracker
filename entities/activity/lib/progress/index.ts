/**
 * @file entities/activity/lib/progress/index.ts
 * Public surface for pure Progress calculation helpers.
 *
 * Purpose: Expose the Progress pure-function entrypoint and focused test hooks.
 *          Internal accumulators stay module-local.
 * Used in: `entities/activity/queries/progress/get-progress-page-data.ts`,
 *          unit tests under `entities/activity/lib/progress/*.test.ts`.
 * Used for: Server query composition — fetch data, then call `buildProgressPageData`.
 *
 * Function index:
 * - buildProgressPageData — full page reducer (primary entry)
 * - buildTaskProgress, hasProjectableDueDay — per-task helpers (tests/advanced use)
 * - metricsForTrackingMode, isCurrentMetric — metric vocabulary helpers
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
