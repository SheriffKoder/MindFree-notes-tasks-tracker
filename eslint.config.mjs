import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Next build / generate output
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Playwright local + CI artifacts (large minified report/trace JS)
    "playwright-report/**",
    "playwright-reports/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
