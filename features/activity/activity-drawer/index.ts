/**
 * @file features/activity/activity-drawer/index.ts
 * Public exports for the Activity config drawer island.
 */

export {
  ActivityDrawer,
  type ActivityDrawerProps,
} from "@/features/activity/activity-drawer/ui/activity-drawer";
export {
  ActivityDrawerFooter,
  type ActivityDrawerFooterProps,
} from "@/features/activity/activity-drawer/ui/activity-drawer-footer";
export { useConfigOrchestrator } from "@/features/activity/activity-drawer/model/use-config-orchestrator";
export {
  evaluateActivitySave,
  hasMeaningfulContent,
} from "@/features/activity/activity-drawer/pre-save-orchestrator";
export type {
  ActivitySaveAction,
  ActivitySavePayload,
  EvaluateActivitySaveInput,
  EvaluateActivitySaveResult,
  UseConfigOrchestratorOptions,
  UseConfigOrchestratorResult,
} from "@/features/activity/activity-drawer/pre-save-orchestrator/types";
