/**
 * @file shared/view-switcher/ui/view-icon.tsx
 * Renders the icon for a Notes page view id.
 */

import type { NotesViewId } from "@/shared/view-switcher/lib/note-views";
import { getNotesViewDefinition } from "@/shared/view-switcher/lib/note-views";

/**
 * Props for {@link ViewIcon}.
 */
export interface ViewIconProps {
  /** View id whose icon should render. */
  view: NotesViewId;
  /** Optional class name for the SVG. */
  className?: string;
}

/**
 * Renders the Lucide icon associated with a Notes view.
 *
 * @param props - view id and optional class name
 * @returns icon element
 */
export function ViewIcon({ view, className }: ViewIconProps) {
  const Icon = getNotesViewDefinition(view).icon;

  return <Icon className={className} aria-hidden />;
}
