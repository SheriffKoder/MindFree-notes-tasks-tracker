/**
 * @file shared/config/supabase-tables.ts
 * Supabase table names for MindFree (`mf_` prefix).
 *
 * Change `LIVE_TABLE_PREFIX` here and in `supabase/migrations/*.sql` if you
 * do not want a prefix (use `""` and rename tables accordingly).
 *
 * Home-domain tables (notes, categories, tasks, records, payments) may use
 * `MF_TABLE_PREFIX=mf_testing_` so Vitest int tests and Playwright E2E hit
 * isolation twin tables without touching live Home data.
 *
 * Profile / preferences / security stay on the live `mf_*` names: auth
 * triggers seed those rows, and the protected app shell always reads them.
 */

/** Live app prefix — profile/auth-adjacent tables never twin-swap. */
export const LIVE_TABLE_PREFIX = "mf_";

/**
 * Home-domain table prefix.
 * Defaults to live `mf_`; int/E2E set `MF_TABLE_PREFIX=mf_testing_`.
 */
export const TABLE_PREFIX = process.env.MF_TABLE_PREFIX ?? LIVE_TABLE_PREFIX;

/** Notes table: calendar, general, and quick note rows (`category_id` for undated/quick). */
export const NOTES_TABLE = `${TABLE_PREFIX}notes`;

/** Note categories: undated/quick grouping; Home strips; manage drawer. */
export const NOTE_CATEGORIES_TABLE = `${TABLE_PREFIX}note_categories`;

/** Activity definitions table: tasks and reminders share one model. */
export const ACTIVITIES_TABLE = `${TABLE_PREFIX}task`;

/** Activity completion records: one row per `(task_id, date)`. */
export const ACTIVITY_RECORDS_TABLE = `${TABLE_PREFIX}task_record`;

/** Payments / expenses: one row per payment, scoped by payment date. */
export const PAYMENTS_TABLE = `${TABLE_PREFIX}payments`;

/** App identity per user (1:1 with auth.users). */
export const PROFILES_TABLE = `${LIVE_TABLE_PREFIX}profiles`;

/** Theme, custom surface tokens, accent, and export email. */
export const USER_PREFERENCES_TABLE = `${LIVE_TABLE_PREFIX}user_preferences`;

/** App-level lock settings (hash only). */
export const USER_SECURITY_SETTINGS_TABLE = `${LIVE_TABLE_PREFIX}user_security_settings`;
