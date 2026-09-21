import path from "node:path";

import { defineConfig } from "vitest/config";

const alias = {
  "@": path.resolve(__dirname, "."),
};

export default defineConfig({
  resolve: { alias },
  test: {
    environment: "node",
    projects: [
      {
        resolve: { alias },
        test: {
          name: "unit",
          environment: "node",
          include: ["**/*.test.ts", "tests/**/unit/**/*.test.ts"],
          exclude: [
            "app/development/**",
            "tests/**/int/**",
            "tests/**/unit/**/*.test.tsx",
            "node_modules/**",
          ],
          setupFiles: [
            "./tests/setup/load-app-env.ts",
            "./tests/setup/unit-env.ts",
          ],
        },
      },
      {
        resolve: { alias },
        test: {
          name: "unit-dom",
          environment: "happy-dom",
          include: ["tests/**/unit/**/*.test.tsx"],
          exclude: ["node_modules/**"],
          setupFiles: [
            "./tests/setup/load-app-env.ts",
            "./tests/setup/unit-env.ts",
            "./tests/setup/rtl.ts",
          ],
        },
      },
      {
        resolve: { alias },
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
