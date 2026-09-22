/**
 * @file tests/home/note-edit-write/continuous-proof/e2e/note-edit-write-continuous-proof.spec.ts
 * Continuous-proof E2E for Home — Note edit (write).
 *
 * Purpose: One Playwright happy path that wires login → Home strips → edit →
 *          strip update → hard reload still-new as a single real browser wire.
 * Used in: docs/testing/home/5-note-edit-write/continuous-proof-e2e.md (HIGHEST.1)
 * Used for: Continuous proof under Notes in docs/testing/home/1-what-matters.md
 *
 * Journey (user-readable):
 *   authenticated >> notes load >> notes show >> click note >> update >>
 *   strip updates >> reload still new
 *
 * Pseudo steps (doc):
 * 1. login as isolation-a@example.com
 * 2. open Home
 * 3. see seeded starred strip text ("User A starred note")
 * 4. click that starred card → drawer opens for that note
 * 5. change body (unique suffix) → wait until strip shows new text
 * 6. hard reload Home → strip still shows that new text
 * 7. cleanup: restore seeded title/content on NOTE_A_STARRED_ID
 *
 * Asserts only user-visible outcomes (and reload). No cache keys, no
 * evaluateNoteSave, no mutation spies. Service-role is cleanup only.
 */

import { expect, test } from "@playwright/test";

import {
  ISOLATION_USER_A_EMAIL,
  ISOLATION_USER_A_PASSWORD,
  NOTE_A_STARRED_SEED_CONTENT,
} from "@/tests/home/fixtures";
import { restoreStarredNoteSeed } from "@/tests/home/note-edit-write/continuous-proof/e2e/restore-starred-note-seed";

/////////////////////////////////////////////////////////////
// Seed must be clean before asserts; restore after so the next run is stable.

test.beforeEach(async () => {
  await restoreStarredNoteSeed();
});

test.afterEach(async () => {
  await restoreStarredNoteSeed();
});

test("Home note edit persists through strip update and hard reload", async ({
  page,
}) => {
  // Unique body so a no-op save cannot accidentally pass the strip assert.
  const updatedContent = `${NOTE_A_STARRED_SEED_CONTENT} — e2e ${Date.now()}`;

  /////////////////////////////////////////////////////////////
  // Step 1: login as isolation-a@example.com
  await page.goto("/login");
  await page.getByLabel("Email").fill(ISOLATION_USER_A_EMAIL);
  await page.getByLabel("Password").fill(ISOLATION_USER_A_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  /////////////////////////////////////////////////////////////
  // Step 2: open Home
  await expect(page).toHaveURL("/");
  await expect(
    page.getByRole("button", { name: "Add note" }),
  ).toBeVisible();

  /////////////////////////////////////////////////////////////
  // Step 3: see seeded starred strip text ("User A starred note")
  // Seed content is unique on Home — role/name is enough (no strip id).
  const seededCard = page.getByRole("button", {
    name: NOTE_A_STARRED_SEED_CONTENT,
  });
  await expect(seededCard).toBeVisible();

  /////////////////////////////////////////////////////////////
  // Step 4: click that starred card → drawer opens for that note
  await seededCard.click();
  const editDrawer = page.getByRole("dialog", { name: "Edit note" });
  await expect(editDrawer).toBeVisible();
  const contentField = editDrawer.getByPlaceholder("Write your note…");
  await expect(contentField).toHaveValue(NOTE_A_STARRED_SEED_CONTENT);

  /////////////////////////////////////////////////////////////
  // Step 5: change body (unique suffix) → wait until strip shows new text
  // Wait for real PATCH (not only optimistic strip) so step 6 reload can prove DB.
  const patchPersisted = page.waitForResponse(
    (response) =>
      response.request().method() === "PATCH" &&
      /\/api\/notes\/[^/?]+$/.test(new URL(response.url()).pathname) &&
      response.ok(),
  );
  await contentField.fill(updatedContent);
  await patchPersisted;
  await expect(
    page.getByRole("button", { name: updatedContent }),
  ).toBeVisible({ timeout: 15_000 });

  /////////////////////////////////////////////////////////////
  // Step 6: hard reload Home → strip still shows that new text
  await page.reload();
  await expect(
    page.getByRole("button", { name: updatedContent }),
  ).toBeVisible({ timeout: 15_000 });

  /////////////////////////////////////////////////////////////
  // Step 7: cleanup: restore seeded title/content on NOTE_A_STARRED_ID
  // (handled in afterEach via restoreStarredNoteSeed — not a UI assert)
});
