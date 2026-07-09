/**
 * @file shared/list-view/ui/list-view.tsx
 * Responsive wrapper around mobile and desktop list layouts.
 */

import type { ReactNode } from "react";
import { CardGridDesktop } from "@/shared/list-view/ui/card-grid-desktop";
import { CardGirdMobile } from "@/shared/list-view/ui/card-gird-mobile";

export interface ListViewProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  /** Mobile-only: group items by calendar week within `month`. */
  groupByWeek?: boolean;
  /** Item property key holding the ISO date (`YYYY-MM-DD`), e.g. `"date"`. */
  groupByWeekKey?: string;
  /** Mobile-only: whether week sections start expanded. Default `true`. */
  defaultOpen?: boolean;
  /** Month key (`YYYY-MM`) for week grouping. */
  month?: string;
}

export function ListView<T>({
  items,
  renderItem,
  getKey,
  groupByWeek,
  groupByWeekKey,
  defaultOpen,
  month,
}: ListViewProps<T>) {
  return (
    <>
      <CardGirdMobile
        className="md:hidden"
        items={items}
        renderItem={renderItem}
        getKey={getKey}
        groupByWeek={groupByWeek}
        groupByWeekKey={groupByWeekKey}
        defaultOpen={defaultOpen}
        month={month}
      />
      <CardGridDesktop
        className="hidden md:grid"
        items={items}
        renderItem={renderItem}
        getKey={getKey}
      />
    </>
  );
}
