import path from "node:path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    projects: [
      {
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "."),
          },
        },
        test: {
          name: "unit",
          environment: "node",
          include: ["**/*.test.ts"],
          exclude: ["tests/**", "node_modules/**"],
          setupFiles: [
            "./tests/setup/load-app-env.ts",
            "./tests/setup/unit-env.ts",
          ],
        },
      },
      {
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "."),
          },
        },
        test: {
          name: "int",
          environment: "node",
          include: ["tests/**/int/**/*.test.ts"],
          setupFiles: [
            "./tests/setup/load-app-env.ts",
            "./tests/setup/int-env.ts",
          ],
        },
      },
    ],
  },
});
