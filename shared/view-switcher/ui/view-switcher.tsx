/**
 * @file shared/view-switcher/ui/view-switcher.tsx
 * Public Notes page view switcher — responsive mobile cycle + desktop icon row.
 */

import type { NotesViewId } from "@/shared/view-switcher/lib/note-views";
import { ViewSwitcherDesktop } from "@/shared/view-switcher/ui/view-switcher-desktop";
import { ViewSwitcherMobile } from "@/shared/view-switcher/ui/view-switcher-mobile";

/**
 * Props for {@link ViewSwitcher}.
 */
export interface ViewSwitcherProps {
  /** Current active view. */
  view: NotesViewId;
  /** Called when the user selects a view directly (desktop). */
  onViewChange: (nextView: NotesViewId) => void;
  /** Called when the user cycles views (mobile). */
  onCycleView: () => void;
}

/**
 * Renders responsive view switching controls for the Notes page.
 *
 * @param props - current view and navigation callbacks
 * @returns view switcher UI
 */
export function ViewSwitcher({
  view,
  onViewChange,
  onCycleView,
}: ViewSwitcherProps) {
  return (
    <>
      <ViewSwitcherMobile
        className="flex md:hidden"
        view={view}
        onCycleView={onCycleView}
      />
      <ViewSwitcherDesktop
        className="hidden md:flex"
        view={view}
        onViewChange={onViewChange}
      />
    </>
  );
}
