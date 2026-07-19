/**
 * @file features/activity/activity-drawer/model/types.ts
 * Kind-agnostic contracts for controlling the activity definition drawer.
 */

/** Editor intent supplied by the page that owns the drawer state. */
export type ActivityEditorRequest =
  | {
      mode: "edit";
      activityId: string;
    }
  | {
      mode: "create";
    };

/**
 * Minimal controller consumed by ActivityDrawer.
 *
 * Keeping this contract in the feature prevents the reusable drawer from
 * depending on either the Tasks or Reminders view.
 */
export interface ActivityDrawerController {
  isOpen: boolean;
  request: ActivityEditorRequest | null;
  openCreate: () => void;
  openEdit: (activityId: string) => void;
  close: () => void;
  setOpen: (open: boolean) => void;
}
