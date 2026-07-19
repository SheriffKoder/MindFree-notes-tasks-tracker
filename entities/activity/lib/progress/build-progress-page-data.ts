/**
 * @file entities/activity/lib/progress/build-progress-page-data.ts
 * Assembles ProgressPageData: card membership, ordering, and per-task math.
 */

import {
  buildTaskProgress,
  hasProjectableDueDay,
  type ProgressAllTimeRecordValue,
} from "@/entities/activity/lib/progress/build-task-progress";
import type { ProgressPageData } from "@/entities/activity/model/progress-read-models";
import type { Activity, ActivityRecord } from "@/entities/activity/model/types";

/**
 * Inputs for the pure Progress page assembly.
 *
 * `todayIso` must be injected by the caller — never resolved via `new Date()`
 * inside this reducer.
 */
export interface BuildProgressPageDataInput {
  /** Selected month key (`YYYY-MM`). */
  month: string;
  /** Injected today (`YYYY-MM-DD`). */
  todayIso: string;
  /** Task definitions (already kind-scoped). */
  tasks: Activity[];
  /** Selected-month records (preferably already filtered to task IDs). */
  monthRecords: ActivityRecord[];
  /** Minimal all-time value rows for the included tasks. */
  allTimeValues: ProgressAllTimeRecordValue[];
}

function isTaskIncluded(
  activity: Activity,
  month: string,
  todayIso: string,
  hasMonthRecord: boolean,
): boolean {
  if (hasMonthRecord) {
    return true;
  }

  const todayMonth = todayIso.slice(0, 7);

  if (month < todayMonth) {
    return false;
  }

  return hasProjectableDueDay(activity, month, todayIso);
}

/**
 * Builds the full Progress page read model for one month.
 *
 * Card order: non-archived tasks first, archived-history second; definition
 * creation order is preserved within each group.
 *
 * @param input - month, today, definitions, month records, all-time values
 */
export function buildProgressPageData(
  input: BuildProgressPageDataInput,
): ProgressPageData {
  const { month, todayIso, tasks, monthRecords, allTimeValues } = input;

  const taskIds = new Set(tasks.map((task) => task.id));
  const recordsByTaskId = new Map<string, ActivityRecord[]>();
  const allTimeByTaskId = new Map<string, ProgressAllTimeRecordValue[]>();

  for (const record of monthRecords) {
    if (!taskIds.has(record.taskId)) {
      continue;
    }

    const bucket = recordsByTaskId.get(record.taskId);

    if (bucket) {
      bucket.push(record);
    } else {
      recordsByTaskId.set(record.taskId, [record]);
    }
  }

  for (const value of allTimeValues) {
    if (!taskIds.has(value.taskId)) {
      continue;
    }

    const bucket = allTimeByTaskId.get(value.taskId);

    if (bucket) {
      bucket.push(value);
    } else {
      allTimeByTaskId.set(value.taskId, [value]);
    }
  }

  const included = tasks.filter((task) =>
    isTaskIncluded(
      task,
      month,
      todayIso,
      (recordsByTaskId.get(task.id)?.length ?? 0) > 0,
    ),
  );

  const active = included.filter((task) => task.archivedAt === null);
  const archived = included.filter((task) => task.archivedAt !== null);
  const ordered = [...active, ...archived];

  return {
    month,
    tasks: ordered.map((task) =>
      buildTaskProgress(
        task,
        month,
        todayIso,
        recordsByTaskId.get(task.id) ?? [],
        allTimeByTaskId.get(task.id) ?? [],
      ),
    ),
  };
}
