/**
 * @file entities/activity/editor/model/types.ts
 * Contracts for the activity config form and drawer wiring.
 *
 * Purpose: Shared types between the dumb form, useActivityForm, and the drawer.
 * Used in: entities/activity/editor/*, features/activity/activity-drawer/*
 * Used for: Form values, change meta, and controlled-field props.
 */

import type { z } from "zod";

import type { Activity, ActivityKind } from "@/entities/activity/model/types";
import { activityFormObject } from "@/entities/activity/schema/activity-form.schema";

/** Editable definition fields managed by the config form. */
export type ActivityFormValues = z.infer<typeof activityFormObject>;

/** Field-level validation messages keyed by form field. */
export type ActivityFormFieldErrors = Partial<
  Record<keyof ActivityFormValues, string>
>;

/** Autosave feedback surfaced in the drawer footer (wired in Step 13). */
export type ActivitySaveStatus = "idle" | "saving" | "saved" | "error";

/** Metadata emitted with each controlled change. */
export interface ActivityFormChangeMeta {
  isDirty: boolean;
  isValid: boolean;
}

/** Footer metadata emitted for the thin last-saved footer (drawer island). */
export interface ActivityFormFooterMeta {
  formattedLastEditedAt: string | null;
  saveStatus: ActivitySaveStatus;
}

export interface ActivityFormProps {
  /** Existing activity to edit, or `null` for create / empty draft. */
  activity: Activity | null;
  /** Page-owned definition kind; controls kind-specific form presentation. */
  kind: ActivityKind;
  /**
   * Identifies the active editor context (activity id or draft slot).
   * Changing it resets local field state without reacting to cache writes.
   */
  resetKey: string;
  /** Incremented after a successful autosave to snap the dirty baseline. */
  commitKey?: number;
  /** Called when local field state changes. No network I/O in the form. */
  onChange?: (values: ActivityFormValues, meta: ActivityFormChangeMeta) => void;
  /** Optional save feedback from the drawer island (Step 13). */
  saveStatus?: ActivitySaveStatus;
  /** Receives footer metadata for the thin last-saved footer. */
  onFooterMetaChange?: (meta: ActivityFormFooterMeta) => void;
  /** Soft-archive (persisted activities only; Step 13 wires). */
  onArchive?: () => void;
  /** Clear archive (persisted activities only; Step 13 wires). */
  onRestore?: () => void;
  /** Hard-delete (persisted activities only; Step 13 wires). */
  onDelete?: () => void;
  /** Optional wrapper class for drawer layouts that need `flex-1` growth. */
  className?: string;
}

export interface UseActivityFormOptions {
  activity: Activity | null;
  /** Identifies drawer/editor context — changing it resets local field state. */
  resetKey: string;
  /** Incremented after a successful autosave to snap the dirty baseline. */
  commitKey?: number;
  onChange?: (values: ActivityFormValues, meta: ActivityFormChangeMeta) => void;
}

export interface UseActivityFormResult {
  values: ActivityFormValues;
  errors: ActivityFormFieldErrors;
  isDirty: boolean;
  isValid: boolean;
  formattedLastEditedAt: string | null;
  setTitle: (title: string) => void;
  setDescription: (description: string | null) => void;
  setColor: (color: string | null) => void;
  setTrackingMode: (trackingMode: ActivityFormValues["trackingMode"]) => void;
  setScheduleType: (scheduleType: ActivityFormValues["scheduleType"]) => void;
  setScheduleConfig: (
    scheduleConfig: ActivityFormValues["scheduleConfig"],
  ) => void;
  setGoal: (goal: number | null) => void;
  setGoalDuration: (goalDuration: number | null) => void;
  setStartsAt: (startsAt: string | null) => void;
  setEndsAt: (endsAt: string | null) => void;
}
