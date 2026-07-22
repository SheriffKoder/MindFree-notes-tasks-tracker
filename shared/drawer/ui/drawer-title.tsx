/**
 * @file shared/drawer/ui/drawer-title.tsx
 * Visible title text for the shared drawer header slot.
 *
 * Purpose: One typography treatment for New/Edit drawer titles.
 * Used in: payment, note, and activity drawer shells
 * Used for: Pass as AppDrawer `header` so the label is visible, not sr-only.
 */

import { cn } from "@/lib/utils";

export interface DrawerTitleProps {
  children: string;
  className?: string;
}

/**
 * Renders a compact title beside the drawer close control.
 */
export function DrawerTitle({ children, className }: DrawerTitleProps) {
  return (
    <span
      className={cn(
        "truncate text-sm font-medium leading-none",
        className,
      )}
    >
      {children}
    </span>
  );
}
