/**
 * @file tests/home/starred-notes-read/async-section/unit/home-notes-section-loading.test.tsx
 * Locks CHEAPEST.1 for Starred notes (read) — View — load home strips.
 *
 * Doc: docs/testing/home/2-starred-notes-read/async-section.md
 *      → section "View — load home strips"
 *      → decision table cell: **Should** × **Unit** × item 1 (CHEAPEST.1)
 *      → CHEAPEST TEST(s) #1
 *
 * Contract: `useHomeNotesQuery` → `{ isPending: true, data: undefined }`
 *           → HomeNotesSection shows “Loading notes…” ([1]–[2]).
 *
 * Why this cell (not Integration / E2E): async-section practice is mock-only;
 * cheapest proof of the pending UI branch without hitting the API/DB.
 *
 * What stays real: `HomeNotesSection` pending+no-data → QueryStatePanel.
 * What is mocked: home-notes query (and sibling hooks / drawer shell).
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

/////////////////////////////////////////////////////////////
// Boundary mocks — network/query + side-effect hooks stay out of the SUT.
/////////////////////////////////////////////////////////////

// CHEAPEST.1 boundary: pending with no cached strips.
vi.mock("@/entities/note/hooks/use-home-notes-query", () => ({
  useHomeNotesQuery: () => ({
    data: undefined,
    isPending: true,
    isError: false,
    error: null,
  }),
}));

// Categories are not needed for the loading branch; keep the hook inert.
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

// Drawer shell is out of scope for the loading-panel contract.
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

describe("HomeNotesSection — Starred notes read async (CHEAPEST.1)", () => {
  /////////////////////////////////////////////////////////////
  // CHEAPEST.1 — Should × Unit (async mock)
  // Doc cell why: cheapest proof of pending UI with mocked query.
  // Flow steps under test: [1] HomeNotesSection, [2] useHomeNotesQuery.
  // Protects: Home notes area shows “Loading notes…” while strips are pending.
  // Regression: blank shell, wrong empty copy, or strip UI while still pending.

  it("shows Loading notes… when the home-notes query is pending with no data", () => {
    renderWithQueryClient(<HomeNotesSection />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading notes…");
  });
});
