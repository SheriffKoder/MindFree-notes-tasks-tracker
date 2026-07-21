/**
 * @file views/home/ui/home-activity-realtime.tsx
 * Client island that mounts activity realtime sync once for the Home dashboard.
 *
 * Purpose: Keep Today tasks/reminders coherent across tabs without mounting the
 *          hook inside both list islands (one subscription per surface).
 * Used in: views/home/index.tsx
 */

"use client";

import { useActivityRealtimeSync } from "@/entities/activity/client";

/**
 * Subscribes to mf_task + mf_task_record for the signed-in user while Home is open.
 * Renders nothing — cache patches drive Today list re-renders.
 */
export function HomeActivityRealtime() {
  useActivityRealtimeSync();

  return null;
}
