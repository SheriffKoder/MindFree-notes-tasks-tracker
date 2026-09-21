/**
 * @file tests/home/starred-notes-read/async-section/unit/home-notes-section-error.test.tsx
 * Locks CHEAPEST.2 for Starred notes (read) — View — load home strips.
 *
 * Doc: docs/testing/home/2-starred-notes-read/async-section.md
 *      → section "View — load home strips"
 *      → decision table cell: **Should** × **Unit** × item 2 (CHEAPEST.2)
 *      → CHEAPEST TEST(s) #2
 *
 * Contract: `useHomeNotesQuery` → `{ isError: true, error }`
 *           → HomeNotesSection shows the error message as an alert ([1]–[2]).
 *
 * Why this cell (not Integration / E2E): async-section practice is mock-only;
 * cheapest proof of the error UI branch without hitting the API/DB.
 *
 * What stays real: `HomeNotesSection` isError → QueryStatePanel variant=error.
 * What is mocked: home-notes query (and sibling hooks / drawer shell).
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

/////////////////////////////////////////////////////////////
// Boundary mocks — network/query + side-effect hooks stay out of the SUT.
/////////////////////////////////////////////////////////////

const HOME_NOTES_ERROR_MESSAGE = "Failed to fetch home notes.";

// CHEAPEST.2 boundary: query failed; pending/data must not hide the error branch.
vi.mock("@/entities/note/hooks/use-home-notes-query", () => ({
  useHomeNotesQuery: () => ({
    data: undefined,
    isPending: false,
    isError: true,
    error: new Error(HOME_NOTES_ERROR_MESSAGE),
  }),
}));

// Categories are not needed for the error branch; keep the hook inert.
vi.mock("@/entities/note/category/hooks/use-note-categories-query", () => ({
  useNoteCategoriesQuery: () => ({
    data: undefined,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

vi.mock("@/entities/note/hooks/use-notes-realtime-sync", () => ({
  useNotesRealtimeSync: () => undefined,
}));

vi.mock("@/shared/offline-queue", () => ({
  useAuthUserId: () => null,
  useOfflineSync: () => undefined,
}));

vi.mock("@/entities/note/offline", () => ({
  createNotesOfflineSyncAdapter: () => ({
    entity: "notes",
    merge: () => undefined,
  }),
}));

// Drawer shell is out of scope for the error-panel contract.
vi.mock("@/features/notes/note-drawer", () => ({
  NoteDrawer: () => null,
}));

vi.mock("@/features/notes/note-drawer/model/note-realtime-drawer-bridge", () => ({
  notifyNoteDrawerRealtime: () => undefined,
}));

import { HomeNotesSection } from "@/views/home/ui/home-notes-section";

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}

describe("HomeNotesSection — Starred notes read async (CHEAPEST.2)", () => {
  /////////////////////////////////////////////////////////////
  // CHEAPEST.2 — Should × Unit (async mock)
  // Doc cell why: proves error path is visible.
  // Flow steps under test: [1] HomeNotesSection, [2] useHomeNotesQuery.
  // Protects: failed home-notes fetch shows an error alert, not strips/loading.
  // Regression: silent blank, loading forever, or strip UI while isError.

  it("shows the query error message when the home-notes query fails", () => {
    renderWithQueryClient(<HomeNotesSection />);

    expect(screen.getByRole("alert")).toHaveTextContent(HOME_NOTES_ERROR_MESSAGE);
  });
});
