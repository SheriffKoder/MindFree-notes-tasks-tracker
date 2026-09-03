/**
 * @file views/notes/ui/notes-category-select.tsx
 * Category picker beside the Notes page add control.
 *
 * Purpose: Choose which category receives a new general note from "+".
 * Used in: views/notes/ui/notes-client.tsx
 * Used for: Toolbar cluster — ViewSwitcher | CategorySelect | Add.
 *
 * Steps:
 * 1. Render pill chrome matching NotesAddButton / ViewSwitcher
 * 2. Radio list of active categories
 * 3. onValueChange updates selectedCategoryId in the parent
 */

"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface NotesCategorySelectOption {
  id: string;
  name: string;
}

export interface NotesCategorySelectProps {
  /** Active categories from useNoteCategoriesQuery. */
  categories: NotesCategorySelectOption[];
  /** Currently selected category id for add-note. */
  value: string;
  /** Updates the selected category without changing the calendar create path. */
  onValueChange: (categoryId: string) => void;
  className?: string;
  /** Disables the trigger when categories have not hydrated yet. */
  disabled?: boolean;
}

/**
 * Compact category dropdown — chrome matches {@link NotesAddButton}.
 */
export function NotesCategorySelect({
  categories,
  value,
  onValueChange,
  className,
  disabled = false,
}: NotesCategorySelectProps) {
  // Derive label from the selected id (fallback while hydrating)
  const selectedLabel =
    categories.find((category) => category.id === value)?.name ?? "Category";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center rounded-2xl border border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-surface)_88%,transparent)] p-2 shadow-sm",
        className,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={`Note category: ${selectedLabel}`}
            className="h-9 gap-1.5 px-3"
            disabled={disabled || categories.length === 0}
            size="sm"
            title="Choose category for new note"
            type="button"
            variant="ghost"
          >
            <span className="max-w-[7rem] truncate text-sm [color:var(--color-fg)]">
              {selectedLabel}
            </span>
            <ChevronDown
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 [color:var(--color-fg-muted)]"
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[10rem]">
          <DropdownMenuRadioGroup
            value={value}
            onValueChange={onValueChange}
          >
            {categories.map((category) => (
              <DropdownMenuRadioItem key={category.id} value={category.id}>
                {category.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
