/**
 * @file views/home/ui/home-quick-add-icon.tsx
 * Icon shell with a bottom-right plus badge for Home header quick-adds.
 *
 * Purpose: Signal “create” on entity icons (receipt, note, …).
 * Used in: home-notes-section, home-payment-quick-add
 * Used for: Main icon + small Plus overlay at bottom-right.
 */

import type { ReactNode } from "react";
import { Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export interface HomeQuickAddIconProps {
  /** Primary lucide (or other) icon. */
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a primary icon and paints a compact plus at the bottom-right corner.
 */
export function HomeQuickAddIcon({
  children,
  className,
}: HomeQuickAddIconProps) {
  return (
    <span className={cn("relative inline-flex", className)}>
      {children}
      <Plus
        aria-hidden
        className="absolute -bottom-2 -right-2 h-2.5 w-2.5 scale-75 [color:var(--color-fg-muted)]"
        strokeWidth={3}
      />
    </span>
  );
}
