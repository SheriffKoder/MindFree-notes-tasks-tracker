/**
 * @file entities/activity/repository/progress/index.ts
 * Public surface for Progress repository reads (Supabase, RLS-scoped).
 *
 * Purpose: Isolate Progress-specific Supabase reads from definition CRUD and
 *          record write paths.
 * Used in: `entities/activity/repository/index.ts` →
 *          `entities/activity/queries/progress/get-progress-page-data.ts`.
 * Used for: Server-only data inputs for the Progress page read model.
 *
 * Function index:
 * - getAllTimeTaskRecordValues (get-all-time-task-record-values)
 */

export {
  getAllTimeTaskRecordValues,
  type AllTimeTaskRecordValue,
} from "@/entities/activity/repository/progress/get-all-time-task-record-values";
