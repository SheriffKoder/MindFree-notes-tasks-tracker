/**
 * @file shared/list-view/ui/card-gird-mobile.tsx
 * Mobile card grid layout (single column).
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface CardGirdMobileProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  className?: string;
}

export function CardGirdMobile<T>({
  items,
  renderItem,
  getKey,
  className,
}: CardGirdMobileProps<T>) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {items.map((item) => (
        <div key={getKey(item)}>{renderItem(item)}</div>
      ))}
    </div>
  );
}
