/**
 * @file features/activity/activity-record-drawer/index.ts
 * Public exports for the selected-day activity records drawer island.
 */

export {
  ActivityRecordDrawer,
  type ActivityRecordDrawerProps,
} from "@/features/activity/activity-record-drawer/ui/activity-record-drawer";
export {
  ActivityRecordList,
  type ActivityRecordListProps,
} from "@/features/activity/activity-record-drawer/ui/activity-record-list";
export {
  ActivityRecordTaskPicker,
  type ActivityRecordTaskPickerProps,
} from "@/features/activity/activity-record-drawer/ui/activity-record-task-picker";
export {
  useSelectedDayRecords,
  type UseSelectedDayRecordsResult,
} from "@/features/activity/activity-record-drawer/model/use-selected-day-records";
export type { ActivityRecordDrawerController } from "@/features/activity/activity-record-drawer/model/types";
