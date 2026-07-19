/**
 * @file features/activity/quick-record/index.ts
 * Public exports for the inline quick-record feature.
 *
 * Prefer `<QuickRecordCard>` so value controls and the expandable note share
 * one `useQuickRecord` instance. `<QuickRecord>` remains for controls-only
 * slots.
 */

export {
  QuickRecordCard,
  type QuickRecordCardProps,
} from "@/features/activity/quick-record/ui/quick-record-card";
export {
  QuickRecord,
  type QuickRecordProps,
} from "@/features/activity/quick-record/ui/quick-record";
export {
  useQuickRecord,
  type UseQuickRecordOptions,
  type UseQuickRecordResult,
} from "@/features/activity/quick-record/model/use-quick-record";
