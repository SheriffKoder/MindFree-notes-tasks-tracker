/**
 * @file shared/drawer/ui/drawer-header.tsx
 * Top bar with optional header slot and close button.
 */

import { ChevronLeft } from "lucide-react";
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
 * Renders a thin top row — back chevron on the left, optional header slot after it.
 */
export function DrawerHeader({
  header,
  titleId,
  ariaLabel,
  onClose,
}: DrawerHeaderProps) {
  return (
    <div className={DRAWER_HEADER_CLASS}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        aria-label="Close"
        onClick={onClose}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {header ? (
        <div id={titleId} className="min-w-0 flex-1">
          {header}
        </div>
      ) : (
        <span id={titleId} className="sr-only">
          {ariaLabel}
        </span>
      )}
    </div>
  );
}
