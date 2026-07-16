/**
 * @file entities/activity/editor/fields/activity-form-section.tsx
 * Section chrome — h3 + supporting paragraph + field stack.
 */

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export interface ActivityFormSectionProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
}

/**
 * Groups related field rows under a short heading and caption.
 */
export function ActivityFormSection({
  title,
  description,
  children,
  className,
}: ActivityFormSectionProps) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <header className="flex flex-col gap-1 border-b border-[var(--color-border)] pb-3">
        <h3 className="text-h3">{title}</h3>
        <p className="text-caption [color:var(--color-fg-muted)]">{description}</p>
      </header>
      <div className="flex flex-col gap-2">{children}</div>
    </section>
  );
}
