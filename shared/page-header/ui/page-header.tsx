/**
 * @file shared/page-header/ui/page-header.tsx
 * Standard app page header — logo + title/subtitle column.
 *
 * Purpose: One layout for secondary routes: flex-row [logo] [flex-col texts].
 * Used in: notes, tasks/reminders, payments, progress, profile page shells.
 */

import type { ReactNode } from "react";

import { AppLogo } from "@/shared/page-header/ui/app-logo";

/**
 * Props for {@link PageHeader}.
 */
export interface PageHeaderProps {
  /** Page heading (e.g. "Notes"). */
  title: string;
  /** Supporting sentence under the heading. */
  subtitle: ReactNode;
}

/**
 * Renders `[logo] [title + subtitle]` for an authenticated app page.
 */
export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="flex shrink-0 flex-row items-start gap-3">
      <span className="relative w-10 shrink-0 self-start">
        <AppLogo className="absolute top-0 -translate-y-[40%]" />
      </span>

      <div className="flex min-w-0 flex-col gap-0">
        <h2 className="text-h2">{title}</h2>
        <p className="page-header__subtitle">{subtitle}</p>
      </div>
    </section>
  );
}
