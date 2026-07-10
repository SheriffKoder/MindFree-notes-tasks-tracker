/**
 * @file shared/list-view/ui/list-view.tsx
 * Responsive wrapper around mobile and desktop list layouts.
 */

import type { ReactNode } from "react";

import { CardGridDesktop } from "@/shared/list-view/ui/card-grid-desktop";
import { CardGridMobile } from "@/shared/list-view/ui/card-grid-mobile";
import type { WeekGroupingConfig } from "@/shared/week-grouping";

export interface ListViewProps<T> {
  /** List of items to render. */
  items: T[];
  /** Function to render each item - a component that renders the item. */
  renderItem: (item: T) => ReactNode;
  /** Unique identifier for each item. */
  getKey: (item: T) => string;
  /** Mobile-only. When set, CardGridMobile delegates to WeekOrganizer. */
  weekGrouping?: WeekGroupingConfig;
}

export function ListView<T>({
  items,
  renderItem,
  getKey,
  weekGrouping,
}: ListViewProps<T>) {
  return (
    <>
      <CardGridMobile
        className="md:hidden"
        items={items}
        renderItem={renderItem}
        getKey={getKey}
        weekGrouping={weekGrouping}
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
