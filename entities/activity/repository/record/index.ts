/**
 * @file entities/activity/repository/record/index.ts
 * Public surface for activity-record data access (Supabase, RLS-scoped).
 *
 * Records are the write side of the Activity entity; their data access lives
 * under `repository/record/` to stay separate from the definition CRUD at the
 * layer root. Re-exported by `repository/index.ts` (public path unchanged).
 *
 * Function index:
 * - upsertRecord (upsert-record)
 * - deleteRecord (delete-record)
 */

export { upsertRecord } from "@/entities/activity/repository/record/upsert-record";
export { deleteRecord } from "@/entities/activity/repository/record/delete-record";
