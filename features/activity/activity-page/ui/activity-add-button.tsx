/**
 * @file features/activity/activity-page/ui/activity-add-button.tsx
 * Icon-only control that opens the config drawer for a new activity.
 */

"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ActivityAddButtonProps {
  /** Accessible label for the create action. */
  ariaLabel: string;
  /** Opens the drawer in create mode. */
  onClick: () => void;
  className?: string;
}

/**
 * Renders a compact "+" button beside the view switcher.
 */
export function ActivityAddButton({
  ariaLabel,
  onClick,
  className,
}: ActivityAddButtonProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] p-2 shadow-sm",
        className,
      )}
    >
      <Button
        aria-label={ariaLabel}
        className="shrink-0"
        size="icon"
        title={ariaLabel}
        type="button"
        variant="ghost"
        onClick={onClick}
      >
        <Plus aria-hidden className="h-4 w-4 [color:var(--color-fg-muted)]" />
      </Button>
    </div>
  );
}
