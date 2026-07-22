/**
 * @file shared/month-navigator/lib/default-month.ts
 * Default month resolution for URL params and SSR prefetch.
 *
 * Purpose: Single source for `getCurrentMonth`, demo-aware defaults, and
 *          `parseMonthParam` when `?month=` is missing or invalid.
 * Used in: entity `parse-month` re-exports (Step 3), month-scoped URL hooks.
 * Used for: Resolving which `YYYY-MM` bucket to load when the URL has no month.
 */

import { getDemoDefaultMonth } from "@/shared/lib/auth/demo-login-config";

const MONTH_PARAM_PATTERN = /^\d{4}-\d{2}$/;

/**
 * Options for {@link resolveDefaultMonthKey} and {@link parseMonthParam}.
 */
export interface ResolveDefaultMonthOptions {
  /** When true, prefer `DEMO_DEFAULT_MONTH` over the local calendar month. */
  isDemoUser?: boolean;
}

/**
 * Returns the current month as `YYYY-MM` in local time.
 *
 * @returns current month key
 */
export function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

/**
 * Resolves the default month key when no valid `?month=` param is present.
 *
 * @param options - optional demo-user flag
 * @returns demo month from env when demo user and configured; else local today
 */
export function resolveDefaultMonthKey(
  options: ResolveDefaultMonthOptions = {},
): string {
  if (options.isDemoUser) {
    const demoMonth = getDemoDefaultMonth();

    if (demoMonth) {
      return demoMonth;
    }
  }

  return getCurrentMonth();
}

/**
 * Validates and normalizes a `month` search param.
 *
 * @param value - raw `month` param from the URL or API
 * @param options - optional demo-user flag for fallback resolution
 * @returns valid `YYYY-MM` month or the resolved default when invalid
 */
export function parseMonthParam(
  value: string | null | undefined,
  options: ResolveDefaultMonthOptions = {},
): string {
  if (!value || !MONTH_PARAM_PATTERN.test(value)) {
    return resolveDefaultMonthKey(options);
  }

  const [, monthPart] = value.split("-");
  const monthNumber = Number(monthPart);

  if (monthNumber < 1 || monthNumber > 12) {
    return resolveDefaultMonthKey(options);
  }

  return value;
}
