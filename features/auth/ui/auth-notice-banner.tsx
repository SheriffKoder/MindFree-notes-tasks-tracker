/**
 * @file features/auth/ui/auth-notice-banner.tsx
 * Shared banner for auth success, info, and error states.
 */

import { cn } from "@/lib/utils";

import type { AuthNotice } from "@/features/auth/model/auth-notice";

/**
 * Props for the shared auth notice banner.
 */
interface AuthNoticeBannerProps {
  /** Notice content and tone to render. */
  notice: AuthNotice;
}

/**
 * Renders a themed notice banner for auth redirects and fallback states.
 *
 * @param props - banner configuration
 * @returns Styled auth notice block
 */
export function AuthNoticeBanner({ notice }: AuthNoticeBannerProps) {
  const toneClassName =
    notice.tone === "error"
      ? "border-[color:color-mix(in_srgb,var(--color-error)_45%,var(--color-border))] [background-color:color-mix(in_srgb,var(--color-error)_12%,transparent)]"
      : notice.tone === "success"
        ? "border-[color:color-mix(in_srgb,var(--color-success)_40%,var(--color-border))] [background-color:color-mix(in_srgb,var(--color-success)_12%,transparent)]"
        : "border-[var(--color-border)] [background-color:var(--color-surface-secondary)]";

  return (
    <div
      className={cn("rounded-xl border px-4 py-3", toneClassName)}
      role={notice.tone === "error" ? "alert" : "status"}
    >
      <p className="text-sm font-medium [color:var(--color-fg)]">{notice.title}</p>
      <p className="text-caption [color:var(--color-fg-muted)]">
        {notice.description}
      </p>
    </div>
  );
}
