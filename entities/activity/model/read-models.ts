/**
 * @file entities/activity/model/read-models.ts
 * Read-model payloads consumed by Activity pages.
 *
 * The API returns flat lists; client-side lookup maps are derived separately
 * (see entities/activity/lib/build-record-lookup). Definitions are stable and
 * not month-scoped; records are month-scoped.
 */

import type { Activity, ActivityRecord } from "@/entities/activity/model/types";

/**
 * Activity definitions for a kind (stable, not month-scoped).
 */
export interface ActivitiesResponse {
  /** Definitions for the requested kind, active and archived. */
  activities: Activity[];
}

/**
 * Completion records for a single month (flat; lookups derived client-side).
 */
export interface ActivityRecordsResponse {
  /** Month key (`YYYY-MM`). */
  month: string;
  /** All records whose `date` falls in the month. */
  records: ActivityRecord[];
}

/**
 * Initial data loaded by the Tasks server page for SSR hydration.
 */
export interface TasksPageData {
  /** Resolved month key (`YYYY-MM`). */
  month: string;
  /** Task definitions (`kind = task`). */
  activities: ActivitiesResponse;
  /** Current-month records. */
  records: ActivityRecordsResponse;
}
