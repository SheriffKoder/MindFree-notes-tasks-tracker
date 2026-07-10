/**
 * @file shared/week-grouping/ui/ungrouped-items-section.tsx
 * Fallback list for items outside the current month or without a valid date.
 */

import type { ReactNode } from "react";

export interface UngroupedItemsSectionProps<T> {
  month: string;
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
}

/**
 * Renders items that could not be placed in a week bucket.
 */
export function UngroupedItemsSection<T>({
  month,
  items,
  getKey,
  renderItem,
}: UngroupedItemsSectionProps<T>) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-3">
      <p className="text-[11px] leading-tight [color:var(--color-fg-muted)]">
        Outside {month}
      </p>
      {items.map((item) => (
        <div key={getKey(item)}>{renderItem(item)}</div>
      ))}
    </section>
  );
}
