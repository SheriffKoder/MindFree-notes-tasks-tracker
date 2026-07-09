/**
 * @file shared/view-switcher/ui/view-switcher-mobile.tsx
 * Mobile view switcher — single button that cycles through views.
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getNotesViewDefinition } from "@/shared/view-switcher/lib/note-views";
import type { NotesViewId } from "@/shared/view-switcher/lib/note-views";
import { ViewIcon } from "@/shared/view-switcher/ui/view-icon";

/**
 * Props for {@link ViewSwitcherMobile}.
 */
export interface ViewSwitcherMobileProps {
  /** Current active view. */
  view: NotesViewId;
  /** Called when the user taps to cycle to the next view. */
  onCycleView: () => void;
  /** Optional wrapper class name. */
  className?: string;
}

/**
 * Renders a compact cycle button for mobile view switching.
 *
 * @param props - current view and cycle callback
 * @returns mobile view switcher UI
 */
export function ViewSwitcherMobile({
  view,
  onCycleView,
  className,
}: ViewSwitcherMobileProps) {
  const { label } = getNotesViewDefinition(view);

  return (
    <div
      className={cn(
        "flex items-center rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] p-2 shadow-sm",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Current view: ${label}. Switch view.`}
        onClick={onCycleView}
      >
        <ViewIcon view={view} />
      </Button>
    </div>
  );
}
