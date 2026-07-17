/**
 * @file features/activity/quick-record/index.ts
 * Public exports for the inline quick-record feature.
 *
 * The view mounts `<QuickRecord>` in the Today card's `recordSlot`; the shared
 * recording flow (`useQuickRecord`) is the only caller of the record mutations.
 */

export {
  QuickRecord,
  type QuickRecordProps,
} from "@/features/activity/quick-record/ui/quick-record";
export {
  useQuickRecord,
  type UseQuickRecordOptions,
  type UseQuickRecordResult,
} from "@/features/activity/quick-record/model/use-quick-record";
