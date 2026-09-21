/**
 * @file playwright.config.ts
 * Configures Chromium E2E runs, the Next.js test server, and local/CI
 * artifact retention.
 */

import { existsSync, readdirSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);
const e2ePort = process.env.E2E_PORT ?? "3100";
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${e2ePort}`;
const runTimestamp = new Date().toISOString().replaceAll(":", "-");

/** Highest `NNN-…` folder index under a local artifact root (0 if none). */
function highestRunIndex(directory: string): number {
  if (!existsSync(directory)) {
    return 0;
  }

  return readdirSync(directory, { withFileTypes: true }).reduce(
    (highest, entry) => {
      if (!entry.isDirectory()) {
        return highest;
      }

      const match = /^(\d{3})-/.exec(entry.name);
      if (!match) {
        return highest;
      }

      return Math.max(highest, Number(match[1]));
    },
    0,
  );
}

// Local runs keep indexed+timestamped history (`001-2026-…`); CI keeps one set.
const localRunIndex = String(
  Math.max(
    highestRunIndex("test-results"),
    highestRunIndex("playwright-reports"),
  ) + 1,
).padStart(3, "0");
const localRunLabel = `${localRunIndex}-${runTimestamp}`;

const testResultsDirectory = isCI
  ? "test-results"
  : `test-results/${localRunLabel}`;
const htmlReportDirectory = isCI
  ? "playwright-report"
  : `playwright-reports/${localRunLabel}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/e2e/**/*.spec.ts",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  outputDir: testResultsDirectory,
  reporter: [
    ["list"],
    ["html", { outputFolder: htmlReportDirectory, open: "never" }],
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npm run dev -- --hostname 127.0.0.1 --port ${e2ePort}`,
    url: baseURL,
    reuseExistingServer: !isCI,
    env: {
      ...process.env,
      MF_TABLE_PREFIX: "mf_testing_",
    },
  },
});
