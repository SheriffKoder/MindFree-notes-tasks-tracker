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
}

export function ListView<T>({ items, renderItem, getKey }: ListViewProps<T>) {
  return (
    <>
      <CardGirdMobile
        className="md:hidden"
        items={items}
        renderItem={renderItem}
        getKey={getKey}
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
