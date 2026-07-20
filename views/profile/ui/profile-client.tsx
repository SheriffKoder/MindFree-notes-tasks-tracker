/**
 * @file views/profile/ui/profile-client.tsx
 * Client boundary for the Profile page — header and section composition.
 */

"use client";

import { AccountSection } from "@/features/profile/account-section";
import { AppLockSection } from "@/features/profile/app-lock-section";
import { ExportSection } from "@/features/profile/export-section";
import { ThemeSection } from "@/features/profile/theme-section";

/**
 * Renders the Profile page with account, theme, app lock, and export sections.
 */
export function ProfileClient() {
  return (
    <div className="mx-auto flex h-full w-full flex-col gap-4">
      <section className="flex shrink-0 flex-col gap-2">
        <h2 className="text-h2">Profile</h2>
        <p className="page-header__subtitle">
          Manage account details, appearance, app lock, and data export.
        </p>
      </section>

      <div className="relative min-h-0 flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-[-10] z-10 h-8 w-full bg-gradient-to-b from-[var(--color-bg)] to-transparent"
        />
        <div className="flex h-full min-h-0 flex-col overflow-x-auto overflow-y-auto pt-4 md:pt-5">
          <div className="flex flex-col gap-6 pb-8">
            <AccountSection />

            <div className="flex flex-col gap-6">
              <hr className="section-divider" />
              <ThemeSection />
            </div>

            <div className="flex flex-col gap-6">
              <hr className="section-divider" />
              <AppLockSection />
            </div>

            <div className="flex flex-col gap-6">
              <hr className="section-divider" />
              <ExportSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
