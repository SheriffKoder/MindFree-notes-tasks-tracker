/**
 * @file entities/activity/queries/progress/index.ts
 * Public surface for Progress server read use-cases.
 *
 * Purpose: Barrel for Progress query entrypoints.
 * Used in: `entities/activity/server.ts`.
 * Used for: Importing `getProgressPageData` from the activity server surface.
 *
 * Function index:
 * - getProgressPageData (get-progress-page-data)
 */

export { getProgressPageData } from "@/entities/activity/queries/progress/get-progress-page-data";
