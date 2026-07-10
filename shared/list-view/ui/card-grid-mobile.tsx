/**
 * @file shared/list-view/ui/card-grid-mobile.tsx
 * Mobile card grid layout (single column). Delegates to WeekOrganizer when `weekGrouping` is set.
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { WeekGroupingConfig } from "@/shared/week-grouping";
import { WeekOrganizer } from "@/shared/week-grouping";

export interface CardGridMobileProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  className?: string;
  /** When set, mobile layout groups items by calendar week within the month. */
  weekGrouping?: WeekGroupingConfig;
}

/**
 * Mobile single-column layout. Uses {@link WeekOrganizer} when `weekGrouping` is provided.
 */
export function CardGridMobile<T>({
  items,
  renderItem,
  getKey,
  className,
  weekGrouping,
}: CardGridMobileProps<T>) {
  return (
    <div
      key={weekGrouping?.month}
      className={cn("flex flex-col gap-3", className)}
    >
      {weekGrouping ? (
        <WeekOrganizer
          items={items}
          weekGrouping={weekGrouping}
          renderItem={renderItem}
          getKey={getKey}
        />
      ) : (
        items.map((item) => (
          <div key={getKey(item)}>{renderItem(item)}</div>
        ))
      )}
    </div>
  );
}
