/**
 * @file features/activity/activity-drawer/model/activity-realtime-drawer-bridge.ts
 * Lets the activity page realtime hook notify the open definition drawer island.
 *
 * Register/handler wiring: ActivityDrawer registers via
 * useActivityDrawerRealtimeSync; ActivityPageClient wires notify.
 */

import type { RealtimeActivityChangePayload } from "@/entities/activity/client";

type ActivityDrawerRealtimeHandler = (
  payload: RealtimeActivityChangePayload,
) => void;

let drawerRealtimeHandler: ActivityDrawerRealtimeHandler | null = null;

/**
 * Registers the drawer handler while ActivityDrawer is mounted.
 */
export function registerActivityDrawerRealtimeHandler(
  handler: ActivityDrawerRealtimeHandler | null,
): void {
  drawerRealtimeHandler = handler;
}

/**
 * Forwards an applied definition realtime event to the drawer when registered.
 */
export function notifyActivityDrawerRealtime(
  payload: RealtimeActivityChangePayload,
): void {
  drawerRealtimeHandler?.(payload);
}
