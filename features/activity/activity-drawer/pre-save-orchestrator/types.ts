/**
 * @file features/activity/activity-drawer/pre-save-orchestrator/types.ts
 * Contracts for the activity pre-save evaluation pipeline and config orchestrator.
 *
 * Purpose: Shared types between evaluate-activity-save and use-config-orchestrator.
 * Used in: pre-save-orchestrator/evaluate-activity-save.ts,
 *          model/use-config-orchestrator.ts
 */

import type {
  ActivityFormChangeMeta,
  ActivityFormValues,
  ActivitySaveStatus,
} from "@/entities/activity/editor/model/types";
import type { Activity, ActivityKind } from "@/entities/activity/model/types";

/** Resolved save intent after the create-vs-patch decision. */
export type ActivitySaveAction = "create" | "patch" | "noop";

/** Payload passed to create/patch mutations — the editable form snapshot. */
export type ActivitySavePayload = ActivityFormValues;

export interface EvaluateActivitySaveInput {
  values: ActivityFormValues;
  meta: ActivityFormChangeMeta;
  /** Persisted activity when editing; `null` for create drafts. */
  activity: Activity | null;
}

export interface EvaluateActivitySaveResult {
  action: ActivitySaveAction;
  payload: ActivitySavePayload;
}

export interface UseConfigOrchestratorOptions {
  /** Persisted activity when editing; `null` for create drafts. */
  activity: Activity | null;
  /** Page-provided kind (`task` on Tasks; never chosen in the drawer). */
  kind: ActivityKind;
  /** Drawer open flag — resets save UI when a session starts. */
  isOpen: boolean;
  /** Switches create intent to edit mode after the first row exists. */
  onActivityCreated: (activityId: string) => void;
  /** Closes the drawer after a successful hard-delete. */
  onDeleted?: () => void;
}

export interface UseConfigOrchestratorResult {
  saveStatus: ActivitySaveStatus;
  handleChange: (
    values: ActivityFormValues,
    meta: ActivityFormChangeMeta,
  ) => void;
  /** Incremented after a successful autosave to snap the form dirty baseline. */
  commitKey: number;
  /** Soft-archive the persisted activity (immediate, not debounced). */
  archive: () => void;
  /** Clear archive on the persisted activity (immediate, not debounced). */
  restore: () => void;
  /** Hard-delete the persisted activity (immediate, not debounced). */
  remove: () => void;
}
