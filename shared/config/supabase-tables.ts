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

/** Payments / expenses: one row per payment, scoped by payment date. */
export const PAYMENTS_TABLE = `${TABLE_PREFIX}payments`;

/** App identity per user (1:1 with auth.users). */
export const PROFILES_TABLE = `${TABLE_PREFIX}profiles`;

/** Theme, custom surface tokens, accent, and export email. */
export const USER_PREFERENCES_TABLE = `${TABLE_PREFIX}user_preferences`;

/** App-level lock settings (hash only). */
export const USER_SECURITY_SETTINGS_TABLE = `${TABLE_PREFIX}user_security_settings`;
