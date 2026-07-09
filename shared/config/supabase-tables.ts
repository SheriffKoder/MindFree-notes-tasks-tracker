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
