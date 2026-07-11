/**
 * @file features/notes/note-drawer/pre-save-orchestrator/index.ts
 * Public exports for the drawer pre-save orchestrator island.
 */

export { evaluateNoteSave, resolveOpeningCalendarDate } from "@/features/notes/note-drawer/pre-save-orchestrator/evaluate-note-save";
export { usePreSaveOrchestrator } from "@/features/notes/note-drawer/pre-save-orchestrator/use-pre-save-orchestrator";
export type {
  EvaluateNoteSaveInput,
  EvaluateNoteSaveResult,
  NoteSaveAction,
  NoteSavePayload,
  UsePreSaveOrchestratorOptions,
  UsePreSaveOrchestratorResult,
} from "@/features/notes/note-drawer/pre-save-orchestrator/types";
