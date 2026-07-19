/**
 * @file entities/activity/lib/record/derive-today-progress.ts
 * Derives a single day's progress for one activity from its record (afterthoughts §2).
 *
 * Purpose: Home Today shows independent count / duration progress; the math
 *          must live in the entity so no consumer recomputes it
 *          (home-page.md: "The Home page should never calculate these values
 *          independently"). Completion is derived — there is no stored flag.
 * Used in: Home Today derivation (`build-today-activities`); calendar pills.
 *
 * Function index:
 * - deriveTodayProgress: activity + record → { done, dimensions[] }
 */

import { isMeaningfulRecord } from "@/entities/activity/lib/record/is-meaningful-record";
import {
  resolveRecordConfiguration,
  type RecordConfiguration,
} from "@/entities/activity/lib/record/resolve-record-configuration";
import type {
  TodayProgress,
  TodayProgressDimension,
} from "@/entities/activity/model/read-models";
import type { Activity, ActivityRecord } from "@/entities/activity/model/types";

function buildDimension(
  kind: TodayProgressDimension["kind"],
  value: number,
  configuredGoal: number | null,
): TodayProgressDimension {
  const goal =
    configuredGoal !== null && configuredGoal > 0 ? configuredGoal : null;
  const remaining = goal === null ? null : Math.max(0, goal - value);
  const percent =
    goal === null ? null : Math.min(100, Math.round((value / goal) * 100));

  return {
    kind,
    label: kind === "count" ? "Count" : "Minutes",
    value,
    goal,
    remaining,
    percent,
  };
}

function buildDimensions(
  config: RecordConfiguration,
  record: ActivityRecord | null,
): TodayProgressDimension[] {
  const count = record?.count ?? 0;
  const duration = record?.duration ?? 0;

  switch (config.trackingMode) {
    case "duration":
      return [buildDimension("duration", duration, config.goalDuration)];
    case "count+duration":
      return [
        buildDimension("count", count, config.goal),
        buildDimension("duration", duration, config.goalDuration),
      ];
    case "boolean":
    case "count":
      return [buildDimension("count", count, config.goal)];
  }
}

/**
 * Derives one day's progress for an activity. Configuration comes from
 * `resolveRecordConfiguration` (record snapshots when present, otherwise the
 * current activity). When any goals are configured, `done` requires every
 * configured dimension to reach its own target. Unbounded dimensions do not
 * gate completion. With no goals, completion falls back to `isMeaningfulRecord`
 * using the effective tracking mode.
 *
 * @param activity - activity definition
 * @param record - the day's record, or `null` when nothing is recorded
 * @returns derived progress fields
 */
export function deriveTodayProgress(
  activity: Activity,
  record: ActivityRecord | null,
): TodayProgress {
  const config = resolveRecordConfiguration(activity, record);
  const dimensions = buildDimensions(config, record);
  const boundedDimensions = dimensions.filter(
    (dimension) => dimension.goal !== null,
  );
  const done =
    record !== null &&
    (boundedDimensions.length > 0
      ? boundedDimensions.every(
          (dimension) =>
            dimension.goal !== null && dimension.value >= dimension.goal,
        )
      : isMeaningfulRecord(record, config.trackingMode));

  return { done, dimensions };
}
