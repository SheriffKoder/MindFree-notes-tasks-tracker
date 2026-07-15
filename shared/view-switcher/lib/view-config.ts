/**
 * @file shared/view-switcher/lib/view-config.ts
 * Generic, page-agnostic view-switcher config: types + pure selectors.
 *
 * Each page (Notes, Tasks, …) owns a {@link ViewConfig} listing its views; the
 * shared switcher UI and navigation hook interpret that config. This keeps
 * page-specific view business logic out of `shared/` (project-structure §4).
 */

import type { LucideIcon } from "lucide-react";

/**
 * A single selectable view within a page's view switcher.
 */
export interface ViewDefinition<Id extends string = string> {
  /** URL search param value. */
  id: Id;
  /** Short label shown below the mobile icon. */
  label: string;
  /** Hover tooltip (desktop) / next-cycle hint (mobile). */
  title: string;
  /** Icon shown in the switcher. */
  icon: LucideIcon;
  /** Optional responsive class applied to this view's desktop button. */
  desktopClassName?: string;
}

/**
 * A page's complete view-switcher configuration.
 */
export interface ViewConfig<Id extends string = string> {
  /** Ordered views (the mobile cycle follows this order). */
  views: readonly ViewDefinition<Id>[];
  /** View used when `?view=` is missing or invalid. */
  defaultView: Id;
  /** Accessible label for the desktop switcher tablist. */
  ariaLabel: string;
}

/**
 * Resolves a raw `?view=` param into a valid view id for the config.
 *
 * @param value - raw `view` search param
 * @param config - page view config
 * @returns validated view id (falls back to `config.defaultView`)
 */
export function parseViewParam<Id extends string>(
  value: string | undefined,
  config: ViewConfig<Id>,
): Id {
  if (value && config.views.some((view) => view.id === value)) {
    return value as Id;
  }

  return config.defaultView;
}

/**
 * Returns the definition for a view id, falling back to the first view.
 *
 * @param config - page view config
 * @param id - view id to resolve
 * @returns matching view definition
 */
export function getViewDefinition<Id extends string>(
  config: ViewConfig<Id>,
  id: Id,
): ViewDefinition<Id> {
  return config.views.find((view) => view.id === id) ?? config.views[0];
}

/**
 * Returns the next view id in cycle order (wraps around).
 *
 * @param config - page view config
 * @param current - current view id
 * @returns next view id
 */
export function getNextView<Id extends string>(
  config: ViewConfig<Id>,
  current: Id,
): Id {
  const currentIndex = config.views.findIndex((view) => view.id === current);
  const nextIndex = (currentIndex + 1) % config.views.length;

  return config.views[nextIndex]?.id ?? config.defaultView;
}
