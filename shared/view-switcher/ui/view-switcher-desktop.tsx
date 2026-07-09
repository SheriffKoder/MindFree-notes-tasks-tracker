/**
 * @file shared/view-switcher/ui/view-switcher-desktop.tsx
 * Desktop view switcher — row of icon buttons for direct selection.
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  NOTE_VIEWS,
  type NotesViewId,
} from "@/shared/view-switcher/lib/note-views";
import { ViewIcon } from "@/shared/view-switcher/ui/view-icon";

/**
 * Props for {@link ViewSwitcherDesktop}.
 */
export interface ViewSwitcherDesktopProps {
  /** Current active view. */
  view: NotesViewId;
  /** Called when the user selects a view. */
  onViewChange: (nextView: NotesViewId) => void;
  /** Optional wrapper class name. */
  className?: string;
}

/**
 * Renders a segmented icon row for desktop view switching.
 *
 * @param props - current view and selection callback
 * @returns desktop view switcher UI
 */
export function ViewSwitcherDesktop({
  view,
  onViewChange,
  className,
}: ViewSwitcherDesktopProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] p-2 shadow-sm",
        className,
      )}
      role="tablist"
      aria-label="Notes view"
    >
      {NOTE_VIEWS.map((definition) => {
        const isActive = definition.id === view;

        return (
          <Button
            key={definition.id}
            type="button"
            variant={isActive ? "secondary" : "ghost"}
            size="icon"
            role="tab"
            aria-selected={isActive}
            aria-label={definition.label}
            onClick={() => onViewChange(definition.id)}
          >
            <ViewIcon view={definition.id} />
          </Button>
        );
      })}
    </div>
  );
}
