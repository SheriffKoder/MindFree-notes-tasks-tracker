/**
 * @file entities/profile/lib/hash-app-password.ts
 * Hash and verify app-lock passwords with Node `scrypt` (no plaintext storage).
 *
 * Stored format: `scrypt$<saltHex>$<hashHex>`
 */

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const HASH_PREFIX = "scrypt";

/**
 * Hashes a plaintext app-lock password for storage.
 *
 * @param password - plaintext from the request body only
 * @returns encoded salt+hash string for `app_password_hash`
 */
export async function hashAppPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;

  return `${HASH_PREFIX}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

/**
 * Verifies plaintext against a stored app-lock hash.
 *
 * @param password - plaintext candidate
 * @param encodedHash - value from `app_password_hash`
 * @returns whether the password matches
 */
export async function verifyAppPassword(
  password: string,
  encodedHash: string,
): Promise<boolean> {
  const parts = encodedHash.split("$");

  if (parts.length !== 3 || parts[0] !== HASH_PREFIX) {
    return false;
  }

  const [, saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");

  if (salt.length === 0 || expected.length === 0) {
    return false;
  }

  const actual = (await scryptAsync(password, salt, expected.length)) as Buffer;

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}
