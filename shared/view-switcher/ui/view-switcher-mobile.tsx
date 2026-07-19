/**
 * @file shared/view-switcher/ui/view-switcher-mobile.tsx
 * Mobile view switcher — single button that cycles through views.
 */

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getNextView,
  getViewDefinition,
  type ViewConfig,
} from "@/shared/view-switcher/lib/view-config";
import { ViewIcon } from "@/shared/view-switcher/ui/view-icon";

/**
 * Props for {@link ViewSwitcherMobile}.
 */
export interface ViewSwitcherMobileProps<Id extends string> {
  /** Page view config. */
  config: ViewConfig<Id>;
  /** Current active view. */
  view: Id;
  /** Called when the user taps to cycle to the next view. */
  onCycleView: () => void;
  /** Optional wrapper class name. */
  className?: string;
}

/**
 * Renders a compact cycle button for mobile view switching.
 *
 * @param props - config, current view, and cycle callback
 * @returns mobile view switcher UI
 */
export function ViewSwitcherMobile<Id extends string>({
  config,
  view,
  onCycleView,
  className,
}: ViewSwitcherMobileProps<Id>) {
  const current = getViewDefinition(config, view);
  const next = getViewDefinition(config, getNextView(config, view));

  return (
    <div className={cn("flex items-center rounded-2xl shadow-sm", className)}>
      <Button
        type="button"
        variant="ghost"
        className="h-auto flex-col p-1 aspect-square w-14 border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)]"
        aria-label={`Current view: ${current.title}. Switch to ${next.title}.`}
        title={`Switch to ${next.title}`}
        onClick={onCycleView}
      >
        <ViewIcon config={config} view={view} />
        <span className="text-[10px] leading-none [color:var(--color-fg-muted)]">
          {current.label}
        </span>
      </Button>
    </div>
  );
}
