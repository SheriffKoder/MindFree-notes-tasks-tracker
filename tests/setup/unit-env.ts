/**
 * @file tests/setup/unit-env.ts
 * Ensures colocated unit tests keep the live `mf_` table prefix.
 */

delete process.env.MF_TABLE_PREFIX;
