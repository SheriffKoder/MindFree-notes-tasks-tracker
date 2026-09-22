/**
 * @file tests/setup/int-env.ts
 * Integration-test env: point table names at `mf_testing_*` twins.
 * Must run via Vitest setupFiles before modules under test load.
 */

process.env.MF_TABLE_PREFIX = "mf_testing_";
