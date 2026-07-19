/**
 * @file entities/activity/repository/progress/index.ts
 * Public surface for Progress repository reads (Supabase, RLS-scoped).
 *
 * Progress inputs are server-only and live under `repository/progress/` so they
 * stay separate from definition CRUD and record write paths. Re-exported by
 * `repository/index.ts`.
 *
 * Function index:
 * - getAllTimeTaskRecordValues (get-all-time-task-record-values)
 */

export {
  getAllTimeTaskRecordValues,
  type AllTimeTaskRecordValue,
} from "@/entities/activity/repository/progress/get-all-time-task-record-values";
