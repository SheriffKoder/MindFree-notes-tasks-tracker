/**
 * @file features/activity/activity-drawer/pre-save-orchestrator/index.ts
 * Public exports for the activity pre-save evaluation island.
 */

export {
  evaluateActivitySave,
  hasMeaningfulContent,
} from "@/features/activity/activity-drawer/pre-save-orchestrator/evaluate-activity-save";
export type {
  ActivitySaveAction,
  ActivitySavePayload,
  EvaluateActivitySaveInput,
  EvaluateActivitySaveResult,
  UseConfigOrchestratorOptions,
  UseConfigOrchestratorResult,
} from "@/features/activity/activity-drawer/pre-save-orchestrator/types";
