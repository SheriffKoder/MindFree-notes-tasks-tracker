/**
 * @file shared/offline-queue/ui/offline-banner.tsx
 * Quiet offline indicator — centered at screen top while the browser is offline.
 *
 * Purpose: Unobtrusive signal that edits queue locally until reconnect.
 * Used in: views/notes/ui/notes-client.tsx (first consumer)
 * Used for: Desktop label + icon; mobile icon only.
 *
 * Placement: centered on the viewport top on mobile; on desktop, shifted by the
 * app shell’s `md:pl-24` side-nav gutter so it centers in the main content area.
 *
 * Mount: waits for a client online check before rendering, so a first paint while
 * online never flashes the banner. Once shown, it stays mounted through the
 * slide-up exit, then unmounts after the transition.
 */

"use client";

import { useEffect, useState } from "react";
import { Save, WifiOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { useOnlineStatus } from "@/shared/offline-queue/hooks/use-online-status";

export const DEFAULT_OFFLINE_BANNER_LABEL = "Offline | saving";

/** Matches `duration-300` on the slide transition. */
const SLIDE_MS = 300;

export interface OfflineBannerProps {
  className?: string;
  /** Desktop label before the icon — hidden on small screens. */
  label?: string;
}

/**
 * Renders a fixed top-center indicator that slides in while offline.
 */
export function OfflineBanner({
  className,
  label = DEFAULT_OFFLINE_BANNER_LABEL,
}: OfflineBannerProps) {
  const isOnline = useOnlineStatus();
  const [hasChecked, setHasChecked] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  /////////////////////////////////////////////////////////////
  // Defer until after mount so we read real `navigator.onLine`.
  useEffect(function markOnlineStatusChecked() {
    setHasChecked(true);
  }, []);

  /////////////////////////////////////////////////////////////
  // Mount only when offline (after check); keep mounted for slide-up exit.
  useEffect(
    function syncBannerMount() {
      if (!hasChecked) {
        return;
      }

      if (!isOnline) {
        setShouldRender(true);

        /////////////////////////////////////////////////////////////
        // Next frame: start off-screen, then slide down.
        const frameId = window.requestAnimationFrame(function slideDown() {
          setIsVisible(true);
        });

        return function cancelSlideDown() {
          window.cancelAnimationFrame(frameId);
        };
      }

      setIsVisible(false);

      if (!shouldRender) {
        return;
      }

      const timeoutId = window.setTimeout(function unmountAfterSlideUp() {
        setShouldRender(false);
      }, SLIDE_MS);

      return function cancelUnmount() {
        window.clearTimeout(timeoutId);
      };
    },
    [hasChecked, isOnline, shouldRender],
  );

  if (!shouldRender) {
    return null;
  }

  return (
    <div
      role="status"
      aria-hidden={!isVisible}
      aria-live="polite"
      aria-label={
        isVisible
          ? "Offline. Changes will save when you reconnect."
          : undefined
      }
      className={cn(
        // Full-bleed top strip; md:pl-24 matches AppShell’s side-nav gutter.
        "pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-center md:pl-24",
        "transition-transform duration-300 ease-out",
        isVisible ? "translate-y-0" : "-translate-y-full",
        className,
      )}
    >
      <div className="flex w-fit items-center gap-1.5 rounded-b-xl border border-t-0 border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2 text-sm text-amber-500">
        <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
        <span className="hidden md:inline">{label}</span>
        <Save className="h-4 w-4 shrink-0 md:hidden" aria-hidden />
      </div>
    </div>
  );
}
