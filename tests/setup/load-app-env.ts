/**
 * @file tests/setup/load-app-env.ts
 * Loads `.env*` into `process.env` for Vitest via Vite `loadEnv`.
 */

import { loadEnv } from "vite";

const modes = ["development", "test", ""];

for (const mode of modes) {
  const loaded = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(loaded)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
