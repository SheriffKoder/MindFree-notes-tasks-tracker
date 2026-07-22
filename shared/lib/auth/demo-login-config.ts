/**
 * @file shared/lib/auth/demo-login-config.ts
 * Server-only demo login feature flag and credentials.
 */

const DEMO_DEFAULT_MONTH_PATTERN = /^\d{4}-\d{2}$/;
const DEMO_DEFAULT_TODAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Whether the Try Demo control is enabled for this deployment.
 *
 * Set `ENABLE_DEMO_LOGIN=true` in local/staging only; omit or `false` in production.
 */
export function isDemoLoginEnabled(): boolean {
  return process.env.ENABLE_DEMO_LOGIN === "true";
}

/**
 * Resolves demo credentials when the feature is enabled and env vars are set.
 *
 * @returns email/password pair, or `null` when demo login is off or misconfigured
 */
export function getDemoLoginCredentials(): {
  email: string;
  password: string;
} | null {
  if (!isDemoLoginEnabled()) {
    return null;
  }

  const email = process.env.DEMO_LOGIN_EMAIL;
  const password = process.env.DEMO_LOGIN_PASSWORD;

  if (!email || !password) {
    return null;
  }

  return { email, password };
}

/**
 * Whether the login page should render Try Demo (flag on + credentials configured).
 */
export function isDemoLoginConfigured(): boolean {
  return getDemoLoginCredentials() !== null;
}

/**
 * Whether `email` matches the configured demo account (`DEMO_LOGIN_EMAIL`).
 *
 * Used to restrict features (e.g. Profile) for the shared demo user. Compares
 * against the env email alone — does not require `ENABLE_DEMO_LOGIN`.
 *
 * @param email - signed-in user email from Supabase Auth
 */
export function isDemoUserEmail(email: string | null | undefined): boolean {
  const demoEmail = process.env.DEMO_LOGIN_EMAIL;

  if (!demoEmail || !email) {
    return false;
  }

  return email.trim().toLowerCase() === demoEmail.trim().toLowerCase();
}

/**
 * Resolves the fixed default month for the demo account (`DEMO_DEFAULT_MONTH`).
 *
 * Used when month-scoped pages have no valid `?month=` param. Does not require
 * `ENABLE_DEMO_LOGIN` — same rule as {@link isDemoUserEmail}.
 *
 * @returns validated `YYYY-MM` month key, or `null` when unset or invalid
 */
export function getDemoDefaultMonth(): string | null {
  const raw = process.env.DEMO_DEFAULT_MONTH?.trim();

  if (!raw || !DEMO_DEFAULT_MONTH_PATTERN.test(raw)) {
    return null;
  }

  const [, monthPart] = raw.split("-");
  const monthNumber = Number(monthPart);

  if (monthNumber < 1 || monthNumber > 12) {
    return null;
  }

  return raw;
}

/**
 * Resolves the fixed "today" date for the demo account (`DEMO_DEFAULT_TODAY`).
 *
 * Home Today joins records by this day and quick-record writes against it, so it
 * must fall inside {@link getDemoDefaultMonth}. When unset, falls back to the
 * 15th of the demo month (clamped to the month's last day).
 *
 * @returns validated `YYYY-MM-DD`, or `null` when neither today nor month is set
 */
export function getDemoDefaultToday(): string | null {
  const raw = process.env.DEMO_DEFAULT_TODAY?.trim();

  if (raw && DEMO_DEFAULT_TODAY_PATTERN.test(raw)) {
    const [yearPart, monthPart, dayPart] = raw.split("-");
    const year = Number(yearPart);
    const monthNumber = Number(monthPart);
    const day = Number(dayPart);
    const probe = new Date(year, monthNumber - 1, day);

    if (
      probe.getFullYear() === year &&
      probe.getMonth() === monthNumber - 1 &&
      probe.getDate() === day
    ) {
      return raw;
    }
  }

  const month = getDemoDefaultMonth();

  if (!month) {
    return null;
  }

  const [yearPart, monthPart] = month.split("-");
  const year = Number(yearPart);
  const monthNumber = Number(monthPart);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const day = Math.min(15, daysInMonth);

  return `${month}-${String(day).padStart(2, "0")}`;
}
