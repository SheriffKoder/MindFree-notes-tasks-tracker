/**
 * @file tests/home/starred-notes-read/async-section/unit/home-notes-section-empty.test.tsx
 * Locks CHEAPEST.3 for Starred notes (read) — View — load home strips.
 *
 * Doc: docs/testing/home/2-starred-notes-read/async-section.md
 *      → section "View — load home strips"
 *      → decision table cell: **Should** × **Unit** × item 3 (CHEAPEST.3)
 *      → CHEAPEST TEST(s) #3
 *
 * Contract: `useHomeNotesQuery` → `{ data: { strips: [] } }` (not pending/error)
 *           → “No note categories on Home.” ([1]).
 *
 * Why this cell (not Integration / E2E): async-section practice is mock-only;
 * cheapest proof of the empty-categories branch without hitting the API/DB.
 *
 * What stays real: `HomeNotesStripArea` empty strips → QueryStatePanel copy.
 * What is mocked: home-notes query (and sibling hooks / drawer shell).
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

/////////////////////////////////////////////////////////////
// Boundary mocks — network/query + side-effect hooks stay out of the SUT.
/////////////////////////////////////////////////////////////

// CHEAPEST.3 boundary: settled success with zero strips (not pending/error).
vi.mock("@/entities/note/hooks/use-home-notes-query", () => ({
  useHomeNotesQuery: () => ({
    data: { strips: [] },
    isPending: false,
    isError: false,
    error: null,
  }),
}));

// Categories unused for empty-strips copy; keep the hook inert.
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

// Drawer shell is out of scope for the empty-panel contract.
vi.mock("@/features/notes/note-drawer", () => ({
  NoteDrawer: () => null,
}));

vi.mock("@/features/notes/note-drawer/model/note-realtime-drawer-bridge", () => ({
  notifyNoteDrawerRealtime: () => undefined,
}));

// Header still mounts on empty; avoid payment quick-add network noise in teardown.
vi.mock("@/views/home/ui/home-payment-quick-add", () => ({
  HomePaymentQuickAdd: () => null,
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

describe("HomeNotesSection — Starred notes read async (CHEAPEST.3)", () => {
  /////////////////////////////////////////////////////////////
  // CHEAPEST.3 — Should × Unit (async mock)
  // Doc cell why: proves empty-categories copy.
  // Flow step under test: [1] HomeNotesSection → HomeNotesStripArea empty branch.
  // Protects: zero strips shows “No note categories on Home.”, not loading/error.
  // Regression: blank shell, loading forever, or strip carousel with no categories.

  it("shows No note categories on Home. when strips are empty", () => {
    renderWithQueryClient(<HomeNotesSection />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "No note categories on Home.",
    );
  });
});
