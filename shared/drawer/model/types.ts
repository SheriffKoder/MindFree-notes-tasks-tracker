/**
 * @file shared/drawer/model/types.ts
 * Public prop types for the shared drawer shell.
 */

import type { ReactNode } from "react";

export interface AppDrawerProps {
  /** Whether the drawer panel is visible. */
  open: boolean;
  /** Called when the user requests open/close (overlay, close button, Escape). */
  onOpenChange: (open: boolean) => void;
  /** Scrollable main content — note editor, forms, etc. */
  children: ReactNode;
  /**
   * Optional top slot for feature-owned controls (e.g. date navigation in
   * `features/notes/note-drawer`). Rendered beside the close button.
   */
  header?: ReactNode;
  /** Optional class name on the sliding panel. */
  className?: string;
  /**
   * Accessible name when `header` does not include a visible title.
   * @default "Panel"
   */
  ariaLabel?: string;
}
