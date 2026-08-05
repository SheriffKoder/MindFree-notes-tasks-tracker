/**
 * @file shared/page-header/ui/app-logo.tsx
 * Static MindFree app logo image (no entrance animation).
 *
 * Purpose: Shared brand glyph for page headers and the Home brand mark.
 * Used in: shared/page-header/ui/page-header.tsx, views/home/ui/home-brand-mark.tsx
 */

import { cn } from "@/lib/utils";

/**
 * Props for {@link AppLogo}.
 */
export interface AppLogoProps {
  /** Extra classes (e.g. absolute positioning / animation on Home). */
  className?: string;
}

/**
 * Renders the MindFree logo asset at the standard header size.
 */
export function AppLogo({ className }: AppLogoProps) {
  return (
    <img
      src="/images/icons/app-logo.png"
      alt=""
      aria-hidden
      className={cn("h-16 w-9", className)}
    />
  );
}
