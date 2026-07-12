/**
 * @file shared/offline-queue/ui/offline-banner.tsx
 * Quiet offline indicator — top-right while the browser is offline.
 *
 * Purpose: Unobtrusive signal that edits queue locally until reconnect.
 * Used in: views/notes/ui/notes-client.tsx (first consumer)
 * Used for: Desktop label + icon; mobile icon only.
 */

"use client";

import { Save, WifiOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { useOnlineStatus } from "@/shared/offline-queue/hooks/use-online-status";

export const DEFAULT_OFFLINE_BANNER_LABEL = "Offline | saving";

export interface OfflineBannerProps {
  className?: string;
  /** Desktop label before the icon — hidden on small screens. */
  label?: string;
}

/**
 * Renders a fixed top-right indicator only while `navigator.onLine` is false.
 */
export function OfflineBanner({
  className,
  label = DEFAULT_OFFLINE_BANNER_LABEL,
}: OfflineBannerProps) {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Offline. Changes will save when you reconnect."
      className={cn(
        "fixed right-4 top-4 z-[60] flex w-fit items-center gap-1.5 text-sm text-[var(--color-fg-muted)]",
        className,
      )}
    >
      <span className="hidden md:inline">{label}</span>
      <Save className="h-4 w-4 shrink-0 md:hidden" aria-hidden />
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
    </div>
  );
}
