/**
 * @file features/activity/activity-page/ui/activity-page-client.tsx
 * Shared client boundary for Tasks/Reminders — layout, URL state, and controls.
 *
 * Re-render isolation: the calendar pane reads useActivityFilter; the list pane
 * must stay a NON-consumer so toggling the filter never re-renders it.
 * ActivityViewsSection is memoized so drawer state updates don't re-render the
 * calendar/list tree.
 */

"use client";

import { useCallback, useMemo } from "react";

import type { Activity, ActivityKind } from "@/entities/activity";
import { useActivitiesQuery } from "@/entities/activity/client";
import { ActivityDrawer } from "@/features/activity/activity-drawer";
import { buildActivityPageCopy } from "@/features/activity/activity-page/lib/activity-page-copy";
import { buildActivityViewConfig } from "@/features/activity/activity-page/lib/activity-views";
import { ActivityFilterProvider } from "@/features/activity/activity-page/model/activity-filter-context";
import { useActivityDefinitionDrawer } from "@/features/activity/activity-page/model/use-activity-definition-drawer";
import { useActivityPageSelection } from "@/features/activity/activity-page/model/use-activity-page-selection";
import { useActivityPageUrlState } from "@/features/activity/activity-page/model/use-activity-page-url-state";
import { useActivityRecordsDrawer } from "@/features/activity/activity-page/model/use-activity-records-drawer";
import { ActivityAddButton } from "@/features/activity/activity-page/ui/activity-add-button";
import { ActivityFilter } from "@/features/activity/activity-page/ui/activity-filter";
import { ActivityViewsSection } from "@/features/activity/activity-page/ui/activity-views-section";
import { ActivityRecordDrawer } from "@/features/activity/activity-record-drawer";
import { MonthNavigator } from "@/shared/month-navigator";
import { ViewSwitcherMobile } from "@/shared/view-switcher";

export interface ActivityPageClientProps {
  /** Definition kind owned by the mounting route. */
  kind: ActivityKind;
  /** Page heading (e.g. "Tasks" / "Reminders"). */
  title: string;
  /** Supporting sentence under the heading. */
  subtitle: string;
}

/**
 * Renders the activity page shell with month/filter controls and a responsive
 * calendar + list body (side by side on desktop, toggled on mobile).
 */
export function ActivityPageClient({
  kind,
  title,
  subtitle,
}: ActivityPageClientProps) {
  const copy = useMemo(
    () => buildActivityPageCopy(kind, title, subtitle),
    [kind, subtitle, title],
  );
  const viewConfig = useMemo(
    () => buildActivityViewConfig(copy.viewAriaLabel, copy.viewListTitle),
    [copy.viewAriaLabel, copy.viewListTitle],
  );

  const { month, view, previousMonth, nextMonth, cycleView } =
    useActivityPageUrlState(viewConfig);

  const { highlightedDate, selectDate, clearSelection } =
    useActivityPageSelection(month);

  // The page coordinates two independent drawers:
  // - `drawer` edits definitions from Add/list-card interactions.
  // - `recordsDrawer` edits records belonging to one clicked calendar day.
  const drawer = useActivityDefinitionDrawer();
  const recordsDrawer = useActivityRecordsDrawer();

  // Phase 5 — mount useActivityRealtimeSync(...) here.
  // Phase 6 — mount useOfflineSync(userId, [activityOfflineAdapter]) here.

  const { data } = useActivitiesQuery(kind);
  const activities = data?.activities ?? [];

  const handleDaySelect = useCallback(
    (date: string) => {
      selectDate(date);
      drawer.close();
      recordsDrawer.openForDate(date);
    },
    [drawer.close, recordsDrawer.openForDate, selectDate],
  );

  const handleAdd = useCallback(() => {
    clearSelection();
    recordsDrawer.close();
    drawer.openCreate();
  }, [clearSelection, drawer.openCreate, recordsDrawer.close]);

  const handleActivityClick = useCallback(
    (activity: Activity) => {
      recordsDrawer.close();
      drawer.openEdit(activity.id);
    },
    [drawer.openEdit, recordsDrawer.close],
  );

  return (
    <ActivityFilterProvider>
      <div className="mx-auto flex h-full w-full flex-col gap-4">
        <section className="flex shrink-0 flex-col gap-2">
          <h2 className="text-h2">{copy.title}</h2>
          <p className="page-header__subtitle">{copy.subtitle}</p>
        </section>

        <section
          aria-label={copy.controlsAriaLabel}
          className="flex shrink-0 flex-row items-center justify-between gap-3"
        >
          <MonthNavigator
            className="min-w-0 flex-1"
            month={month}
            onPrevious={previousMonth}
            onNext={nextMonth}
          />
          <div className="flex shrink-0 items-center gap-2">
            <ActivityFilter
              activities={activities}
              filterAriaLabel={copy.filterAriaLabel}
              filterEmptyLabel={copy.filterEmptyLabel}
              filterShowAllLabel={copy.filterShowAllLabel}
              filterShowLabel={copy.filterShowLabel}
            />
            <ViewSwitcherMobile
              className="flex md:hidden"
              config={viewConfig}
              view={view}
              onCycleView={cycleView}
            />
            <ActivityAddButton
              ariaLabel={copy.addAriaLabel}
              onClick={handleAdd}
            />
          </div>
        </section>

        <div className="relative min-h-0 flex-1">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-[-10] z-10 h-8 w-full bg-gradient-to-b from-[var(--color-bg)] to-transparent"
          />
          <div className="flex h-full min-h-0 flex-col overflow-x-auto overflow-y-auto pt-4 md:pt-5">
            <div className="min-h-0 flex-1">
              <ActivityViewsSection
                copy={copy}
                kind={kind}
                month={month}
                view={view}
                highlightedDate={highlightedDate}
                onDaySelect={handleDaySelect}
                onActivityClick={handleActivityClick}
              />
            </div>
          </div>
        </div>

        <ActivityDrawer
          drawer={drawer}
          kind={kind}
          onDismiss={clearSelection}
        />
        <ActivityRecordDrawer
          drawer={recordsDrawer}
          kind={kind}
          onDismiss={clearSelection}
        />
      </div>
    </ActivityFilterProvider>
  );
}
