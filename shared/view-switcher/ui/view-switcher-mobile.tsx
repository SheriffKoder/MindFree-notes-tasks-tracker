/**
 * @file shared/view-switcher/ui/view-switcher-mobile.tsx
 * Mobile view switcher — single button that cycles through views.
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getNextNotesView,
  getNotesViewDefinition,
} from "@/shared/view-switcher/lib/note-views";
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
  const current = getNotesViewDefinition(view);
  const next = getNotesViewDefinition(getNextNotesView(view));

  return (
    <div
      className={cn(
        "flex items-center rounded-2xl shadow-sm",
        className,
      )}
    >
      <Button
        type="button"
        variant="ghost"
        className="h-auto flex-col p-1 aspect-square w-14 border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)]"
        aria-label={`Current view: ${current.title}. Switch to ${next.title}.`}
        title={`Switch to ${next.title}`}
        onClick={onCycleView}
      >
        <ViewIcon view={view} />
        <span className="text-[10px] leading-none [color:var(--color-fg-muted)]">
          {current.label}
        </span>
      </Button>
    </div>
  );
}
