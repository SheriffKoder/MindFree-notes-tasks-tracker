/**
 * @file features/activity/activity-page/index.ts
 * Public exports for the shared Tasks/Reminders page composition.
 */

export {
  ActivityPageClient,
  type ActivityPageClientProps,
} from "@/features/activity/activity-page/ui/activity-page-client";
export {
  ActivityViewsSection,
  type ActivityViewsSectionProps,
} from "@/features/activity/activity-page/ui/activity-views-section";
export {
  ActivityCalendarPane,
  type ActivityCalendarPaneProps,
} from "@/features/activity/activity-page/ui/activity-calendar-pane";
export {
  ActivityListPane,
  type ActivityListPaneProps,
} from "@/features/activity/activity-page/ui/activity-list-pane";
export {
  ActivityFilter,
  type ActivityFilterProps,
} from "@/features/activity/activity-page/ui/activity-filter";
export {
  ActivityAddButton,
  type ActivityAddButtonProps,
} from "@/features/activity/activity-page/ui/activity-add-button";
export {
  ActivityFilterProvider,
  useActivityFilter,
  type ActivityFilterValue,
} from "@/features/activity/activity-page/model/activity-filter-context";
export {
  useActivityDefinitionDrawer,
  type UseActivityDefinitionDrawerResult,
} from "@/features/activity/activity-page/model/use-activity-definition-drawer";
export {
  useActivityRecordsDrawer,
  type UseActivityRecordsDrawerResult,
} from "@/features/activity/activity-page/model/use-activity-records-drawer";
export {
  useActivityPageSelection,
  type UseActivityPageSelectionResult,
} from "@/features/activity/activity-page/model/use-activity-page-selection";
export {
  useActivityPageUrlState,
  type UseActivityPageUrlStateResult,
} from "@/features/activity/activity-page/model/use-activity-page-url-state";
export {
  buildActivityPageCopy,
  type ActivityPageCopy,
} from "@/features/activity/activity-page/lib/activity-page-copy";
export {
  buildActivityViewConfig,
  type ActivityViewId,
} from "@/features/activity/activity-page/lib/activity-views";
export {
  isActivityShown,
  isDayActivityShown,
  toggleHiddenActivity,
} from "@/features/activity/activity-page/lib/activity-filter";
export {
  resolveViewQueryState,
  type ViewQueryMessages,
  type ViewQueryState,
} from "@/features/activity/activity-page/lib/resolve-view-query-state";
