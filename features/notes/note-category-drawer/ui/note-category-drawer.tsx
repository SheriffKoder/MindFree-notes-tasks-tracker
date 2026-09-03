/**
 * @file features/notes/note-category-drawer/ui/note-category-drawer.tsx
 * Category manage drawer island — lists, form, and hard-delete confirm.
 *
 * Purpose: Orchestrate category CRUD UI; mutations live in the entity client.
 * Used in: views/notes/ui/notes-client.tsx
 * Used for: Add/edit/archive/restore/hard-delete from the Notes page.
 *
 * Steps:
 * 1. Load includeDeleted categories while open
 * 2. Split active vs archived client-side
 * 3. Route UI actions to entity mutation hooks
 * 4. Notify the page when a category leaves the switcher
 */

"use client";

import { useCallback, useMemo } from "react";

import { Button } from "@/components/ui/button";
import type { NoteCategory } from "@/entities/note/client";
import {
  useHardDeleteNoteCategoryMutation,
  useNoteCategoriesQuery,
  useRestoreNoteCategoryMutation,
  useSoftDeleteNoteCategoryMutation,
  useUpdateNoteCategoryMutation,
} from "@/entities/note/client";
import { AppDrawer, DrawerTitle } from "@/shared/drawer";
import { mapCategoryApiError } from "@/features/notes/note-category-drawer/lib/map-category-api-error";
import { useNoteCategoryDrawerState } from "@/features/notes/note-category-drawer/model/use-note-category-drawer-state";
import { CategoryActiveList } from "@/features/notes/note-category-drawer/ui/category-active-list";
import { CategoryArchivedList } from "@/features/notes/note-category-drawer/ui/category-archived-list";
import { CategoryDeleteConfirm } from "@/features/notes/note-category-drawer/ui/category-delete-confirm";
import { CategoryEditForm } from "@/features/notes/note-category-drawer/ui/category-edit-form";

export interface NoteCategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  /**
   * Fired after archive or hard-delete so the Notes page can leave
   * `view=category:<id>` (and drop an add-note override).
   */
  onCategoryRemoved?: (categoryId: string) => void;
}

/**
 * Composes the category manager inside `AppDrawer`.
 */
export function NoteCategoryDrawer({
  open,
  onClose,
  onCategoryRemoved,
}: NoteCategoryDrawerProps) {
  const {
    panel,
    feedback,
    openCreate,
    openEdit,
    openHardDelete,
    showList,
    setFeedback,
  } = useNoteCategoryDrawerState(open);

  /////////////////////////////////////////////////////////////
  // Queries — active is SSR-seeded; withDeleted loads when open
  /////////////////////////////////////////////////////////////
  const { data: activeData } = useNoteCategoriesQuery();
  const { data: withDeletedData, isPending: isArchivedPending } =
    useNoteCategoriesQuery({
      includeDeleted: true,
      enabled: open,
    });

  const activeCategories = useMemo(() => {
    const source = withDeletedData ?? activeData;
    return (source?.categories ?? []).filter(
      (category) => category.deletedAt == null,
    );
  }, [activeData, withDeletedData]);

  const archivedCategories = useMemo(() => {
    return (withDeletedData?.categories ?? []).filter(
      (category) => category.deletedAt != null,
    );
  }, [withDeletedData]);

  const updateMutation = useUpdateNoteCategoryMutation();
  const archiveMutation = useSoftDeleteNoteCategoryMutation();
  const restoreMutation = useRestoreNoteCategoryMutation();
  const hardDeleteMutation = useHardDeleteNoteCategoryMutation();

  const editingCategory = useMemo(() => {
    if (panel.kind !== "edit") {
      return null;
    }

    return (
      activeCategories.find((category) => category.id === panel.categoryId) ??
      null
    );
  }, [activeCategories, panel]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        onClose();
      }
    },
    [onClose],
  );

  const handleToggleShowOnHome = useCallback(
    (category: NoteCategory, showOnHome: boolean) => {
      if (category.showOnHome === showOnHome) {
        return;
      }

      updateMutation.mutate(
        { id: category.id, body: { showOnHome } },
        {
          onError: (error) => {
            setFeedback(mapCategoryApiError(error));
          },
        },
      );
    },
    [setFeedback, updateMutation],
  );

  const handleArchive = useCallback(
    (category: NoteCategory) => {
      archiveMutation.mutate(
        { category },
        {
          onSuccess: () => {
            // Leave the edit form unless this row was the one being edited
            if (panel.kind === "edit" && panel.categoryId === category.id) {
              showList();
            }

            onCategoryRemoved?.(category.id);
          },
          onError: (error) => {
            setFeedback(mapCategoryApiError(error));
          },
        },
      );
    },
    [archiveMutation, onCategoryRemoved, panel, setFeedback, showList],
  );

  const handleRestore = useCallback(
    (category: NoteCategory) => {
      restoreMutation.mutate(
        { id: category.id },
        {
          onError: (error) => {
            setFeedback(mapCategoryApiError(error));
          },
        },
      );
    },
    [restoreMutation, setFeedback],
  );

  const handleHardDeleteConfirm = useCallback(() => {
    if (panel.kind !== "hard-delete") {
      return;
    }

    const { category } = panel;

    // Diary never reaches this panel — belt-and-suspenders with the list UI
    if (category.isDefault) {
      setFeedback("The default Diary category cannot be permanently deleted.");
      showList();
      return;
    }

    hardDeleteMutation.mutate(
      { id: category.id },
      {
        onSuccess: () => {
          showList();
          onCategoryRemoved?.(category.id);
        },
        onError: (error) => {
          setFeedback(mapCategoryApiError(error));
        },
      },
    );
  }, [
    hardDeleteMutation,
    onCategoryRemoved,
    panel,
    setFeedback,
    showList,
  ]);

  const editingCategoryId = panel.kind === "edit" ? panel.categoryId : null;
  const togglingId = updateMutation.isPending
    ? (updateMutation.variables?.id ?? null)
    : null;
  const archivingId = archiveMutation.isPending
    ? (archiveMutation.variables?.category.id ?? null)
    : null;
  const restoringId = restoreMutation.isPending
    ? (restoreMutation.variables?.id ?? null)
    : null;

  return (
    <AppDrawer
      ariaLabel="Manage categories"
      header={<DrawerTitle>Manage categories</DrawerTitle>}
      open={open}
      onOpenChange={handleOpenChange}
    >
      <div className="flex flex-col gap-6">
        {feedback ? (
          <p
            className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm [background-color:var(--color-error-light)] [color:var(--color-error)]"
            role="alert"
          >
            {feedback}
          </p>
        ) : null}

        {panel.kind === "hard-delete" ? (
          <CategoryDeleteConfirm
            category={panel.category}
            isPending={hardDeleteMutation.isPending}
            onCancel={showList}
            onConfirm={handleHardDeleteConfirm}
          />
        ) : (
          <>
            {panel.kind === "create" ? (
              <section aria-label="Add category" className="flex flex-col gap-3">
                <h2 className="text-sm font-medium [color:var(--color-fg)]">
                  Add category
                </h2>
                <CategoryEditForm
                  category={null}
                  onCancel={showList}
                  onError={setFeedback}
                  onSaved={showList}
                />
              </section>
            ) : null}

            {panel.kind === "edit" && editingCategory ? (
              <section aria-label="Edit category" className="flex flex-col gap-3">
                <h2 className="text-sm font-medium [color:var(--color-fg)]">
                  Edit category
                </h2>
                <CategoryEditForm
                  category={editingCategory}
                  onCancel={showList}
                  onError={setFeedback}
                  onSaved={showList}
                />
              </section>
            ) : null}

            <section aria-label="Active categories" className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium [color:var(--color-fg)]">
                  Active
                </h2>
                {panel.kind === "list" ? (
                  <Button size="sm" type="button" onClick={openCreate}>
                    Add category
                  </Button>
                ) : null}
              </div>
              <CategoryActiveList
                archivingId={archivingId}
                categories={activeCategories}
                editingCategoryId={editingCategoryId}
                togglingId={togglingId}
                onArchive={handleArchive}
                onEdit={openEdit}
                onToggleShowOnHome={handleToggleShowOnHome}
              />
            </section>

            <section aria-label="Archived categories" className="flex flex-col gap-3">
              <h2 className="text-sm font-medium [color:var(--color-fg)]">
                Archived
              </h2>
              {isArchivedPending && !withDeletedData ? (
                <p className="text-sm [color:var(--color-fg-muted)]">
                  Loading archived categories…
                </p>
              ) : (
                <CategoryArchivedList
                  categories={archivedCategories}
                  restoringId={restoringId}
                  onHardDelete={openHardDelete}
                  onRestore={handleRestore}
                />
              )}
            </section>
          </>
        )}
      </div>
    </AppDrawer>
  );
}
