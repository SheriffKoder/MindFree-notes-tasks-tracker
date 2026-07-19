/**
 * @file entities/activity/lib/map-row.ts
 * Maps Supabase rows to domain objects for the Activity domain.
 */

import type {
  Activity,
  ActivityRecord,
  ActivityRecordRow,
  ActivityRow,
} from "@/entities/activity/model/types";

/**
 * Maps an `mf_task` row to the domain {@link Activity}.
 *
 * @param row - raw database row
 * @returns domain activity
 */
export function mapActivityRow(row: ActivityRow): Activity {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    description: row.description,
    color: row.color,
    trackingMode: row.tracking_mode,
    scheduleType: row.schedule_type,
    scheduleConfig: row.schedule_config,
    goal: row.goal,
    goalDuration: row.goal_duration,
    icon: row.icon,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Maps an `mf_task_record` row to the domain {@link ActivityRecord}.
 *
 * @param row - raw database row
 * @returns domain record
 */
export function mapActivityRecordRow(row: ActivityRecordRow): ActivityRecord {
  return {
    id: row.id,
    taskId: row.task_id,
    date: row.date,
    count: row.count,
    duration: row.duration,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
