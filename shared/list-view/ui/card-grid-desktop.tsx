/**
 * @file shared/list-view/ui/card-grid-desktop.tsx
 * Desktop card grid layout (wrapping flexible grid).
 */

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface CardGridDesktopProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  className?: string;
}

export function CardGridDesktop<T>({
  items,
  renderItem,
  getKey,
  className,
}: CardGridDesktopProps<T>) {
  return (
    <div className={cn("grid grid-cols-3 gap-4", className)}>
      {items.map((item) => (
        <div key={getKey(item)} className="min-w-0">
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
