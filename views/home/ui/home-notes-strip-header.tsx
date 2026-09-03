/**
 * @file views/home/ui/home-notes-strip-header.tsx
 * One-row Home category switcher with a chevron to expand to two card rows.
 */

"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import type { HomeNotesStrip } from "@/entities/note/client";
import { cn } from "@/lib/utils";
import { HOME_SECTION_HEADER_CLASS } from "@/views/home/lib/section-header-class";

export interface HomeNotesStripHeaderProps {
  strips: HomeNotesStrip[];
  selectedCategoryId: string;
  isTwoRows: boolean;
  showTwoRowToggle: boolean;
  onSelectCategory: (categoryId: string) => void;
  onToggleTwoRows: () => void;
}

/**
 * Category titles in one row — tap a name to switch strips; chevron expands cards.
 */
export function HomeNotesStripHeader({
  strips,
  selectedCategoryId,
  isTwoRows,
  showTwoRowToggle,
  onSelectCategory,
  onToggleTwoRows,
}: HomeNotesStripHeaderProps) {
  const selectedName =
    strips.find((strip) => strip.categoryId === selectedCategoryId)
      ?.categoryName ?? "notes";

  return (
    <div className="flex min-w-0 items-center gap-3 overflow-x-auto">
      {strips.map((strip) => {
        const isSelected = strip.categoryId === selectedCategoryId;

        return (
          <button
            key={strip.categoryId}
            aria-current={isSelected ? "true" : undefined}
            aria-label={`Show ${strip.categoryName} notes`}
            className={cn(
              HOME_SECTION_HEADER_CLASS,
              "shrink-0 rounded-sm px-0.5 text-left transition-colors hover:[color:var(--color-fg)]",
              isSelected && "[color:var(--color-fg)]",
            )}
            type="button"
            onClick={() => onSelectCategory(strip.categoryId)}
          >
            {strip.categoryName}
          </button>
        );
      })}

      {showTwoRowToggle ? (
        <button
          aria-controls={`home-starred-notes-strip-${selectedCategoryId}`}
          aria-expanded={isTwoRows}
          aria-label={
            isTwoRows
              ? `Show ${selectedName} notes in one row`
              : `Show ${selectedName} notes in two rows`
          }
          className={cn(
            HOME_SECTION_HEADER_CLASS,
            "shrink-0 rounded-sm p-0.5 transition-colors hover:[color:var(--color-fg)]",
          )}
          title={isTwoRows ? "One row" : "Two rows"}
          type="button"
          onClick={onToggleTwoRows}
        >
          {isTwoRows ? (
            <ChevronUp aria-hidden className="h-4 w-4" />
          ) : (
            <ChevronDown aria-hidden className="h-4 w-4" />
          )}
        </button>
      ) : null}
    </div>
  );
}
