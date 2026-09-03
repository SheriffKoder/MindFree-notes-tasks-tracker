/**
 * @file entities/note/editor/ui/note-form-category-select.tsx
 * Category picker in the note editor title row.
 *
 * Purpose: Choose which undated category owns this note.
 * Used in: entities/note/editor/ui/note-form-toggle-buttons.tsx
 * Used for: Create and edit of general/quick notes — hidden for calendar notes.
 *
 * Matches {@link CalendarDropdown}: ghost trigger, dropdown portal above drawer chrome.
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

export interface NoteFormCategoryOption {
  id: string;
  name: string;
}

export interface NoteFormCategorySelectProps {
  categories: NoteFormCategoryOption[];
  value: string | null;
  onValueChange: (categoryId: string) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * Ghost category dropdown — same chrome as the calendar date picker.
 */
export function NoteFormCategorySelect({
  categories,
  value,
  onValueChange,
  error,
  disabled = false,
}: NoteFormCategorySelectProps) {
  const selectedLabel =
    categories.find((category) => category.id === value)?.name ?? "Category";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-invalid={Boolean(error)}
          aria-label={`Note category: ${selectedLabel}`}
          className="h-8 max-w-[9rem] shrink-0 gap-1 px-2"
          disabled={disabled || categories.length === 0}
          size="sm"
          title={selectedLabel}
          type="button"
          variant="ghost"
        >
          <span className="truncate [color:var(--note-form-star-inactive)]">
            {selectedLabel}
          </span>
          <ChevronDown
            aria-hidden
            className="h-3.5 w-3.5 shrink-0 [color:var(--note-form-star-inactive)]"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-[70] min-w-[10rem] border-[var(--color-border)]"
        side="bottom"
        sideOffset={6}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DropdownMenuRadioGroup
          value={value ?? ""}
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
  );
}
