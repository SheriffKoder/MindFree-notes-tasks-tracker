/**
 * @file tests/home/note-edit-write/user-flow/unit/home-notes-section-open-edit.test.tsx
 * Locks CHEAPEST.1 for Note edit (write) — Edit — open drawer and autosave from Home.
 *
 * Doc: docs/testing/home/5-note-edit-write/user-flow.md
 *      → section "Edit — open drawer and autosave from Home"
 *      → decision table cell: **Should** × **Unit** × item 1 (CHEAPEST.1)
 *      → CHEAPEST TEST(s) #1
 *
 * Contract: fixture strip → click starred card → drawer request is
 *           `{ mode: "edit", noteId }` for that note ([1]–[3]).
 *
 * Why this cell (not Integration / E2E): cheapest proof Home wires strip click
 * into the real drawer request; network stays mocked away.
 *
 * What stays real: `HomeNotesSection` → `openEdit` → `useNotesDrawer` request.
 * What is mocked: home-notes query, realtime/offline, NoteDrawer (probe only).
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  FIXTURE_HOME_NOTES_WITH_STRIP,
  FIXTURE_STARRED_NOTE,
} from "@/tests/home/fixtures";
import type { UseNotesDrawerResult } from "@/views/notes/model/editor/use-notes-drawer";

/////////////////////////////////////////////////////////////
// Boundary mocks — network/query + side-effect hooks stay out of the SUT.
/////////////////////////////////////////////////////////////

vi.mock("@/entities/note/hooks/use-home-notes-query", () => ({
  useHomeNotesQuery: () => ({
    data: FIXTURE_HOME_NOTES_WITH_STRIP,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

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

vi.mock("@/features/notes/note-drawer/model/note-realtime-drawer-bridge", () => ({
  notifyNoteDrawerRealtime: () => undefined,
}));

vi.mock("@/views/home/ui/home-payment-quick-add", () => ({
  HomePaymentQuickAdd: () => null,
}));

// Keep real useNotesDrawer; probe receives the edit request after strip click.
vi.mock("@/features/notes/note-drawer", () => ({
  NoteDrawer: ({ drawer }: { drawer: UseNotesDrawerResult }) => {
    const noteId =
      drawer.request?.mode === "edit" ? drawer.request.noteId : "";

    return (
      <div
        data-testid="note-drawer-probe"
        data-open={String(drawer.isOpen)}
        data-mode={drawer.request?.mode ?? ""}
        data-note-id={noteId}
      />
    );
  },
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

describe("HomeNotesSection — Note edit write user flow (CHEAPEST.1)", () => {
  /////////////////////////////////////////////////////////////
  // CHEAPEST.1 — Should × Unit (user flow + mocks)
  // Doc cell why: cheapest proof Home wires strip click → edit request.
  // Flow steps under test: [1]–[3] click → openEdit → drawer request.
  // Protects: starred card opens edit for that note id.
  // Regression: click does nothing, or drawer opens without the clicked id.

  it("opens the drawer in edit mode for the clicked starred note id", () => {
    renderWithQueryClient(<HomeNotesSection />);

    fireEvent.click(
      screen.getByRole("button", {
        name: new RegExp(FIXTURE_STARRED_NOTE.content),
      }),
    );

    const probe = screen.getByTestId("note-drawer-probe");

    expect(probe).toHaveAttribute("data-open", "true");
    expect(probe).toHaveAttribute("data-mode", "edit");
    expect(probe).toHaveAttribute("data-note-id", FIXTURE_STARRED_NOTE.id);
  });
});
