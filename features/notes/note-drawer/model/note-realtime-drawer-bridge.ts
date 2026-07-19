/**
 * @file features/notes/note-drawer/model/note-realtime-drawer-bridge.ts
 * Lets the notes page realtime hook notify the open drawer island.
 */

import type { RealtimeNoteChangePayload } from "@/entities/note/client";

type NoteDrawerRealtimeHandler = (payload: RealtimeNoteChangePayload) => void;

let drawerRealtimeHandler: NoteDrawerRealtimeHandler | null = null;

/**
 * Registers the drawer handler while NoteDrawer is mounted.
 */
export function registerNoteDrawerRealtimeHandler(
  handler: NoteDrawerRealtimeHandler | null,
): void {
  drawerRealtimeHandler = handler;
}

/**
 * Forwards an applied realtime event to the drawer when registered.
 */
export function notifyNoteDrawerRealtime(
  payload: RealtimeNoteChangePayload,
): void {
  drawerRealtimeHandler?.(payload);
}
