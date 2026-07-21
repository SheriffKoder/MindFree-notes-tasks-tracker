/**
 * @file views/home/ui/home-activity-offline.tsx
 * Client island that mounts activity offline sync once for the Home dashboard.
 *
 * Purpose: Merge pending activity writes on load / cross-tab storage and flush
 *          on reconnect — without mounting inside both Today list islands.
 * Used in: views/home/index.tsx
 */

"use client";

import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createActivityOfflineSyncAdapter } from "@/entities/activity/offline";
import { useAuthUserId, useOfflineSync } from "@/shared/offline-queue";

/**
 * Registers the activity offline adapter while Home is open.
 * Renders nothing — cache patches drive Today list re-renders.
 */
export function HomeActivityOffline() {
  const queryClient = useQueryClient();
  const userId = useAuthUserId();
  const activityOfflineAdapter = useMemo(
    () => createActivityOfflineSyncAdapter(queryClient),
    [queryClient],
  );

  useOfflineSync(userId, [activityOfflineAdapter]);

  return null;
}
