/**
 * @file tests/e2e/login.spec.ts
 * Verifies the Chromium E2E harness can start the app, open the public login
 * route, and observe its primary user-facing controls.
 */

import { expect, test } from "@playwright/test";

test("loads the login page", async ({ page }) => {
  // Open a public route so this setup smoke does not depend on seeded DB state.
  await page.goto("/login");

  // Prove the rendered page is usable through the same semantics a user sees.
  await expect(
    page.getByRole("heading", { level: 1, name: "MindFree" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
});
