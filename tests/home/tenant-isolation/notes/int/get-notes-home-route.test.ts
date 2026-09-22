/**
 * @file tests/home/tenant-isolation/notes/int/get-notes-home-route.test.ts
 * Locks CHEAPEST.2 for Home notes tenant isolation — View — read home strips.
 *
 * Doc: docs/testing/home/1-tenant-isolation/notes.md
 *      → section "View — read home strips"
 *      → decision table cell: **Should** × **Integration** × item 2 (CHEAPEST.2)
 *      → CHEAPEST TEST(s) #2
 *
 * Contract: `GET` on `/api/notes/home` with no session → 401 `{ error: "Unauthorized" }`
 *           and must not call `getHomeNotesResponse` ([4] in the flow).
 *
 * Why this cell (not Unit / E2E): proves the route does not serve strip data
 * without a session. Complements CHEAPEST.1 (scoped read when userId exists).
 *
 * What stays real: `GET` handler in `app/api/notes/home/route.ts` (401 branch).
 * What is fixtured: `requireAuthenticatedUserId` → `null` (no cookie/session).
 *                   `getHomeNotesResponse` mocked so a leak would show as a call.
 */

import { describe, expect, it, vi } from "vitest";

// Spy so we can assert the handler never loads strips when auth fails.
const getHomeNotesResponse = vi.fn();

// Replace the note server barrel: only the GET path matters here; createQuickNote
// is stubbed because the barrel exports it and the mock must be complete.
vi.mock("@/entities/note/server", () => ({
  getHomeNotesResponse: (...args: unknown[]) => getHomeNotesResponse(...args),
  createQuickNote: vi.fn(),
}));

// No session → requireAuthenticatedUserId returns null (CHEAPEST.2 boundary).
vi.mock("@/shared/lib/auth/require-authenticated-user", () => ({
  requireAuthenticatedUserId: async () => null,
}));

import { GET } from "@/app/api/notes/home/route";

describe("GET /api/notes/home — Home notes tenant isolation (CHEAPEST.2)", () => {
  /////////////////////////////////////////////////////////////
  // CHEAPEST.2 — Should × Integration
  // Doc cell why: proves the route does not serve data without a session.
  // Flow step under test: [4] GET /api/notes/home + requireAuthenticatedUserId.
  // Protects: anonymous / expired session never receives Home strips.
  // Regression: no-session GET still returns 200 + note payload.

  it("returns 401 and does not fetch strips when there is no session", async () => {
    getHomeNotesResponse.mockReset();

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
    expect(getHomeNotesResponse).not.toHaveBeenCalled();
  });
});
