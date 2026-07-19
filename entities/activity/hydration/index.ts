/**
 * @file entities/activity/hydration/index.ts
 * Segment barrel for activity SSR cache seeders.
 *
 * Function index:
 * - seedActivityCaches (seed-activity-caches) — one kind + records
 * - seedHomeActivityCaches (seed-activity-caches) — both kinds + records
 */

export {
  seedActivityCaches,
  seedHomeActivityCaches,
} from "@/entities/activity/hydration/seed-activity-caches";
