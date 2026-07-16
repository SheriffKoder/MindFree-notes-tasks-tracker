/**
 * @file features/activity/activity-drawer/pre-save-orchestrator/evaluate-activity-save.ts
 * Pure create-vs-patch decision for the activity config drawer.
 *
 * Purpose: Decide whether form changes should create, patch, or noop.
 * Used in: features/activity/activity-drawer/model/use-config-orchestrator.ts
 *
 * No date routing, conflict gate, or auto-delete — activities are never
 * deleted by emptying fields (archive/delete are imperative drawer actions).
 *
 * Function index:
 * - hasMeaningfulContent
 * - evaluateActivitySave
 */

import type { ActivityFormValues } from "@/entities/activity/editor/model/types";
import type {
  EvaluateActivitySaveInput,
  EvaluateActivitySaveResult,
} from "@/features/activity/activity-drawer/pre-save-orchestrator/types";

/**
 * @returns whether the form has a title worth persisting.
 */
export function hasMeaningfulContent(values: ActivityFormValues): boolean {
  return Boolean(values.title.trim());
}

/**
 * Runs the pre-save decision: create (new + valid + titled), patch (dirty +
 * valid), or noop.
 */
export function evaluateActivitySave(
  input: EvaluateActivitySaveInput,
): EvaluateActivitySaveResult {
  const { values, meta, activity } = input;
  const payload = values;

  if (!activity?.id) {
    if (meta.isValid && hasMeaningfulContent(values)) {
      return { action: "create", payload };
    }

    return { action: "noop", payload };
  }

  if (meta.isDirty && meta.isValid) {
    return { action: "patch", payload };
  }

  return { action: "noop", payload };
}
