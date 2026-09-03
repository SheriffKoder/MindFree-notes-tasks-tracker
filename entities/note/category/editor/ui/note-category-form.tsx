/**
 * @file entities/note/category/editor/ui/note-category-form.tsx
 * Plain category editor — name + show-on-home checkbox.
 *
 * Purpose: Dumb editor shell; delegates save routing to the manage drawer.
 * Used in: features/notes/note-category-drawer/ui/category-edit-form.tsx
 * Used for: Controlled fields and validation; no create/update mutations.
 */

"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useNoteCategoryForm } from "@/entities/note/category/editor/model/use-note-category-form";
import type { NoteCategoryFormProps } from "@/entities/note/category/editor/model/types";

/**
 * Controlled category editor for the manage-drawer shell.
 *
 * Layout:
 * - Name text field
 * - Show on Home checkbox
 */
export function NoteCategoryForm({
  category,
  resetKey,
  commitKey = 0,
  onChange,
  className,
}: NoteCategoryFormProps) {
  const { values, errors, setName, setShowOnHome } = useNoteCategoryForm({
    category,
    resetKey,
    commitKey,
    onChange,
  });

  const nameFieldId = "note-category-name";
  const homeFieldId = "note-category-show-on-home";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={nameFieldId}>Name</Label>
        <Input
          aria-invalid={Boolean(errors.name)}
          autoComplete="off"
          id={nameFieldId}
          maxLength={80}
          name="name"
          placeholder="Category name"
          value={values.name}
          onChange={(event) => setName(event.target.value)}
        />
        {errors.name ? (
          <p className="text-caption [color:var(--color-error)]" role="alert">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          checked={values.showOnHome}
          id={homeFieldId}
          onCheckedChange={(checked) => setShowOnHome(checked === true)}
        />
        <Label className="font-normal" htmlFor={homeFieldId}>
          Show on Home
        </Label>
      </div>
    </div>
  );
}
