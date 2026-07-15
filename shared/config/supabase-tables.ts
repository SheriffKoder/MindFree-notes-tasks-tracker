/**
 * @file shared/config/supabase-tables.ts
 * Supabase table names for MindFree (`mf_` prefix).
 *
 * Change `TABLE_PREFIX` here and in `supabase/migrations/*.sql` if you
 * do not want a prefix (use `""` and rename tables accordingly).
 */

/** MindFree table prefix — keep in sync with SQL migrations. */
export const TABLE_PREFIX = "mf_";

/** Notes table: calendar, general, and quick note rows. */
export const NOTES_TABLE = `${TABLE_PREFIX}notes`;

/** Activity definitions table: tasks and reminders share one model. */
export const ACTIVITIES_TABLE = `${TABLE_PREFIX}task`;

/** Activity completion records: one row per `(task_id, date)`. */
export const ACTIVITY_RECORDS_TABLE = `${TABLE_PREFIX}task_record`;
