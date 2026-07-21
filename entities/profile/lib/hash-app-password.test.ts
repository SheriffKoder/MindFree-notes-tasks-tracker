/**
 * @file entities/profile/lib/hash-app-password.test.ts
 * Unit tests for app-lock password hashing.
 */

import { describe, expect, it } from "vitest";

import {
  hashAppPassword,
  verifyAppPassword,
} from "@/entities/profile/lib/hash-app-password";

describe("hashAppPassword / verifyAppPassword", () => {
  it("verifies a matching password and rejects a wrong one", async () => {
    const hash = await hashAppPassword("secret-lock");

    expect(hash.startsWith("scrypt$")).toBe(true);
    await expect(verifyAppPassword("secret-lock", hash)).resolves.toBe(true);
    await expect(verifyAppPassword("wrong", hash)).resolves.toBe(false);
  });

  it("rejects malformed stored hashes", async () => {
    await expect(verifyAppPassword("secret-lock", "not-a-hash")).resolves.toBe(
      false,
    );
  });
});
