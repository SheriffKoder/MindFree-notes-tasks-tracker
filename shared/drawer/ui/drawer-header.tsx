/**
 * @file shared/drawer/ui/drawer-header.tsx
 * Top bar with optional header slot and close button.
 */

import { X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { DRAWER_HEADER_CLASS } from "@/shared/drawer/lib/drawer-panel-classes";

export interface DrawerHeaderProps {
  header?: ReactNode;
  titleId: string;
  ariaLabel: string;
  onClose: () => void;
}

/**
 * Renders the drawer chrome row — feature header on the left, close on the right.
 */
export function DrawerHeader({
  header,
  titleId,
  ariaLabel,
  onClose,
}: DrawerHeaderProps) {
  return (
    <div className={DRAWER_HEADER_CLASS}>
      {header ? (
        <div id={titleId} className="min-w-0 flex-1">
          {header}
        </div>
      ) : (
        <span id={titleId} className="sr-only">
          {ariaLabel}
        </span>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Close"
        onClick={onClose}
      >
        <X />
      </Button>
    </div>
  );
}
