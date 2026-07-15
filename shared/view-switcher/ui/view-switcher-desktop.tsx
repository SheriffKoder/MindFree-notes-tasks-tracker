/**
 * @file shared/view-switcher/ui/view-switcher-desktop.tsx
 * Desktop view switcher — row of icon buttons for direct selection.
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ViewConfig } from "@/shared/view-switcher/lib/view-config";
import { ViewIcon } from "@/shared/view-switcher/ui/view-icon";

/**
 * Props for {@link ViewSwitcherDesktop}.
 */
export interface ViewSwitcherDesktopProps<Id extends string> {
  /** Page view config. */
  config: ViewConfig<Id>;
  /** Current active view. */
  view: Id;
  /** Called when the user selects a view. */
  onViewChange: (nextView: Id) => void;
  /** Optional wrapper class name. */
  className?: string;
}

/**
 * Renders a segmented icon row for desktop view switching.
 *
 * @param props - config, current view, and selection callback
 * @returns desktop view switcher UI
 */
export function ViewSwitcherDesktop<Id extends string>({
  config,
  view,
  onViewChange,
  className,
}: ViewSwitcherDesktopProps<Id>) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] p-2 shadow-sm",
        className,
      )}
      role="tablist"
      aria-label={config.ariaLabel}
    >
      {config.views.map((definition) => {
        const isActive = definition.id === view;

        return (
          <Button
            key={definition.id}
            type="button"
            variant={isActive ? "secondary" : "ghost"}
            size="icon"
            className={definition.desktopClassName}
            role="tab"
            aria-selected={isActive}
            aria-label={definition.title}
            title={definition.title}
            onClick={() => onViewChange(definition.id)}
          >
            <ViewIcon config={config} view={definition.id} />
          </Button>
        );
      })}
    </div>
  );
}
