/**
 * @file shared/drawer/ui/drawer-panel.tsx
 * Sliding panel with header chrome and scrollable body.
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  DRAWER_BODY_CLASS,
  DRAWER_PANEL_CLASS,
} from "@/shared/drawer/lib/drawer-panel-classes";
import { DrawerHeader } from "@/shared/drawer/ui/drawer-header";

export interface DrawerPanelProps {
  children: ReactNode;
  header?: ReactNode;
  titleId: string;
  ariaLabel: string;
  className?: string;
  onClose: () => void;
}

/**
 * Right-side drawer panel — dialog semantics, fixed header, scrollable body.
 */
export function DrawerPanel({
  children,
  header,
  titleId,
  ariaLabel,
  className,
  onClose,
}: DrawerPanelProps) {
  return (
    <aside
      role="dialog"
      aria-modal="true"
      aria-labelledby={header ? titleId : undefined}
      aria-label={header ? undefined : ariaLabel}
      className={cn(DRAWER_PANEL_CLASS, className)}
    >
      <DrawerHeader
        header={header}
        titleId={titleId}
        ariaLabel={ariaLabel}
        onClose={onClose}
      />
      <div className={DRAWER_BODY_CLASS}>{children}</div>
    </aside>
  );
}
