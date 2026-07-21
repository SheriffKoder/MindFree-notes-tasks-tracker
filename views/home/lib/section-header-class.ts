/**
 * @file views/home/lib/section-header-class.ts
 * Shared muted section-header text style for Home dashboard headings.
 */

/** h2-sized, medium-weight, muted — used by Starred / Today / priority labels. */
export const HOME_SECTION_HEADER_CLASS =
  "text-[length:var(--text-xs)] font-medium leading-tight [color:var(--color-fg-muted)]";

/**
 * Left inset matching the Today summary chevron (`h-4 w-4`) + `gap-1.5`, so
 * priority labels start on the same pixel as "Today's Tasks" / Reminders text.
 */
export const HOME_PRIORITY_LABEL_INSET_CLASS = "ps-[1.375rem]";
