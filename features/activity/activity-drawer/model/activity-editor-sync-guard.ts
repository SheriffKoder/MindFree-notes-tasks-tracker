/**
 * @file features/activity/activity-drawer/model/activity-editor-sync-guard.ts
 * Drawer editor state for realtime → form sync decisions.
 *
 * Purpose: Block remote form pulls while dirty; allow server wins after idle.
 * Used in: use-activity-drawer-realtime-sync.ts
 */

/** Ms without local edits before an idle open drawer accepts remote form sync. */
export const REMOTE_SYNC_IDLE_MS = 3000;

export interface ActivityEditorSyncState {
  isOpen: boolean;
  activityId: string | null;
  isDirty: boolean;
  openedAt: number;
  lastLocalEditAt: number | null;
}

let editorSyncState: ActivityEditorSyncState = {
  isOpen: false,
  activityId: null,
  isDirty: false,
  openedAt: 0,
  lastLocalEditAt: null,
};

/**
 * Updates the singleton drawer sync guard (one definition drawer per app session).
 */
export function registerActivityEditorSyncState(
  state: ActivityEditorSyncState,
): void {
  editorSyncState = state;
}

/**
 * @returns whether a remote update may replace the open editor fields.
 */
export function shouldSyncRemoteIntoForm(activityId: string): boolean {
  if (!editorSyncState.isOpen || editorSyncState.activityId !== activityId) {
    return false;
  }

  if (editorSyncState.isDirty) {
    return false;
  }

  const idleAnchor =
    editorSyncState.lastLocalEditAt ?? editorSyncState.openedAt;

  return Date.now() - idleAnchor >= REMOTE_SYNC_IDLE_MS;
}
