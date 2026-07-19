/**
 * @file shared/view-switcher/ui/view-switcher.tsx
 * Public, config-driven view switcher — responsive mobile cycle + desktop icon row.
 */

import type { ViewConfig } from "@/shared/view-switcher/lib/view-config";
import { ViewSwitcherDesktop } from "@/shared/view-switcher/ui/view-switcher-desktop";
import { ViewSwitcherMobile } from "@/shared/view-switcher/ui/view-switcher-mobile";

/**
 * Props for {@link ViewSwitcher}.
 */
export interface ViewSwitcherProps<Id extends string> {
  /** Page view config. */
  config: ViewConfig<Id>;
  /** Current active view. */
  view: Id;
  /** Called when the user selects a view directly (desktop). */
  onViewChange: (nextView: Id) => void;
  /** Called when the user cycles views (mobile). */
  onCycleView: () => void;
}

/**
 * Renders responsive view switching controls for a page.
 *
 * @param props - config, current view, and navigation callbacks
 * @returns view switcher UI
 */
export function ViewSwitcher<Id extends string>({
  config,
  view,
  onViewChange,
  onCycleView,
}: ViewSwitcherProps<Id>) {
  return (
    <>
      <ViewSwitcherMobile
        className="flex md:hidden"
        config={config}
        view={view}
        onCycleView={onCycleView}
      />
      <ViewSwitcherDesktop
        className="hidden md:flex"
        config={config}
        view={view}
        onViewChange={onViewChange}
      />
    </>
  );
}
