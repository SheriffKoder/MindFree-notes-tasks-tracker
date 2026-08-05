/**
 * @file views/home/ui/home-brand-mark.tsx
 * Animated MindFree logo + wordmark for the Home header.
 *
 * Purpose: Brand hero mark with mount entrance (logo drop, then name-2 reveal).
 * Used in: views/home/index.tsx
 */

import { AppLogo } from "@/shared/page-header";

import "./home-brand-mark.css";

/**
 * Renders the MindFree logo and split wordmark with entrance motion.
 */
export function HomeBrandMark() {
  return (
    <span className="home-brand-mark inline-flex items-center gap-2">
      <span className="relative w-10 shrink-0 self-stretch">
        <AppLogo className="home-brand-mark-logo absolute top-0" />
      </span>

      <span className="relative z-1 flex items-center" aria-label="MindFree">
        {/* Opaque bg so name-2 appears to slide out from behind this half. */}
        <img
          src="/images/icons/app-name-1.png"
          alt=""
          aria-hidden
          className="relative z-10 aspect-[3.5/1.5] w-[max(5vw,50px)] bg-white dark:invert"
        />
        <img
          src="/images/icons/app-name-2.png"
          alt=""
          aria-hidden
          className="home-brand-mark-name-2 relative z-0 aspect-[3.5/1.5] w-[max(5vw,50px)] dark:invert"
        />
      </span>
    </span>
  );
}
