/**
 * @file shared/list-view/ui/list-view.tsx
 * List/grid wrapper — viewport-responsive or forced per call site.
 */

import type { ReactNode } from "react";

import { CardGridDesktop } from "@/shared/list-view/ui/card-grid-desktop";
import { CardGridMobile } from "@/shared/list-view/ui/card-grid-mobile";
import type { WeekGroupingConfig } from "@/shared/week-grouping";

/** How the list container lays out items. */
export type ListViewLayout = "responsive" | "list" | "grid";

export interface ListViewProps<T> {
  /** List of items to render. */
  items: T[];
  /** Function to render each item - a component that renders the item. */
  renderItem: (item: T) => ReactNode;
  /** Unique identifier for each item. */
  getKey: (item: T) => string;
  /**
   * Container layout.
   * - `responsive` — single column below `md`, grid at `md+` (default)
   * - `list` — single column at all breakpoints
   * - `grid` — grid at all breakpoints
   */
  layout?: ListViewLayout;
  /** When set, list layout delegates to WeekOrganizer. */
  weekGrouping?: WeekGroupingConfig;
}

const listGridProps = {
  responsive: {
    list: "md:hidden",
    grid: "hidden md:grid",
  },
  list: {
    list: undefined,
    grid: "hidden",
  },
  grid: {
    list: "hidden",
    grid: undefined,
  },
} as const;

export function ListView<T>({
  items,
  renderItem,
  getKey,
  layout = "responsive",
  weekGrouping,
}: ListViewProps<T>) {
  const classes = listGridProps[layout];

  return (
    <>
      <CardGridMobile
        className={classes.list}
        items={items}
        renderItem={renderItem}
        getKey={getKey}
        weekGrouping={weekGrouping}
      />
      <CardGridDesktop
        className={classes.grid}
        items={items}
        renderItem={renderItem}
        getKey={getKey}
      />
    </>
  );
}
