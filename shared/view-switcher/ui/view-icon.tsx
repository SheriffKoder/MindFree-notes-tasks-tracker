/**
 * @file shared/view-switcher/ui/view-icon.tsx
 * Renders the icon for a view id within a page's view config.
 */

import {
  getViewDefinition,
  type ViewConfig,
} from "@/shared/view-switcher/lib/view-config";

/**
 * Props for {@link ViewIcon}.
 */
export interface ViewIconProps<Id extends string> {
  /** Page view config. */
  config: ViewConfig<Id>;
  /** View id whose icon should render. */
  view: Id;
  /** Optional class name for the SVG. */
  className?: string;
}

/**
 * Renders the Lucide icon associated with a view.
 *
 * @param props - config, view id, and optional class name
 * @returns icon element
 */
export function ViewIcon<Id extends string>({
  config,
  view,
  className,
}: ViewIconProps<Id>) {
  const Icon = getViewDefinition(config, view).icon;

  return <Icon className={className} aria-hidden />;
}
