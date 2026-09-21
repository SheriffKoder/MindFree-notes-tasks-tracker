/**
 * @file tests/home/fixtures/isolation-users.ts
 * Fixed auth user ids/emails from migration 044 (isolation A/B).
 */

/** Isolation User A — `isolation-a@example.com`. */
export const ISOLATION_USER_A_ID = "a2222222-2222-4222-8222-222222222222";

/** Isolation User A email (migration 044). */
export const ISOLATION_USER_A_EMAIL = "isolation-a@example.com";

/** Isolation User A password (migration 044). */
export const ISOLATION_USER_A_PASSWORD = "IsolationPass123!";

/** Isolation User B — `isolation-b@example.com`. */
export const ISOLATION_USER_B_ID = "b3333333-3333-4333-8333-333333333333";

/** Isolation User B email (migration 044). */
export const ISOLATION_USER_B_EMAIL = "isolation-b@example.com";

/** Isolation User B password (migration 044 — same shared secret). */
export const ISOLATION_USER_B_PASSWORD = "IsolationPass123!";
