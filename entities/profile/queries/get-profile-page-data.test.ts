/**
 * @file entities/profile/queries/get-profile-page-data.test.ts
 * Unit tests for Profile page read-model assembly.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  Profile,
  UserPreferences,
  UserSecuritySettings,
} from "@/entities/profile/model/types";

const ensureProfileExists = vi.fn();
const getProfileRow = vi.fn();
const getPreferencesRow = vi.fn();
const getSecurityRow = vi.fn();

vi.mock("@/entities/profile/repository", () => ({
  ensureProfileExists: (...args: unknown[]) => ensureProfileExists(...args),
  getProfileRow: (...args: unknown[]) => getProfileRow(...args),
  getPreferencesRow: (...args: unknown[]) => getPreferencesRow(...args),
  getSecurityRow: (...args: unknown[]) => getSecurityRow(...args),
}));

import { getProfilePageData } from "@/entities/profile/queries/get-profile-page-data";

const USER_ID = "user-1";
const AUTH_EMAIL = "auth@example.com";

function buildProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: USER_ID,
    displayName: "Ada",
    email: "mirror@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildPreferences(
  overrides: Partial<UserPreferences> = {},
): UserPreferences {
  return {
    userId: USER_ID,
    themeMode: "dark",
    backgroundColor: null,
    backgroundImageUrl: null,
    drawerBackgroundColor: null,
    drawerBackgroundOpacity: null,
    textContrastMode: "dark",
    accentColor: "#6c8eff",
    exportEmail: "export@example.com",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function buildSecurity(
  overrides: Partial<UserSecuritySettings> = {},
): UserSecuritySettings {
  return {
    userId: USER_ID,
    appLockEnabled: true,
    appPasswordHash: "should-never-leak",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("getProfilePageData", () => {
  beforeEach(() => {
    ensureProfileExists.mockReset();
    getProfileRow.mockReset();
    getPreferencesRow.mockReset();
    getSecurityRow.mockReset();

    ensureProfileExists.mockResolvedValue(undefined);
    getProfileRow.mockResolvedValue(buildProfile());
    getPreferencesRow.mockResolvedValue(buildPreferences());
    getSecurityRow.mockResolvedValue(buildSecurity());
  });

  it("ensures once then returns the mapped read model without the password hash", async () => {
    const data = await getProfilePageData(USER_ID, AUTH_EMAIL);

    expect(ensureProfileExists).toHaveBeenCalledTimes(1);
    expect(ensureProfileExists).toHaveBeenCalledWith(USER_ID, AUTH_EMAIL);

    expect(data).toEqual({
      account: {
        displayName: "Ada",
        email: AUTH_EMAIL,
      },
      preferences: {
        themeMode: "dark",
        backgroundColor: null,
        backgroundImageUrl: null,
        drawerBackgroundColor: null,
        drawerBackgroundOpacity: null,
        textContrastMode: "dark",
        accentColor: "#6c8eff",
        exportEmail: "export@example.com",
      },
      security: {
        appLockEnabled: true,
      },
    });

    expect(data).not.toHaveProperty("appPasswordHash");
    expect(JSON.stringify(data)).not.toContain("should-never-leak");
  });

  it("fails loud when a row is still missing after ensure", async () => {
    getPreferencesRow.mockResolvedValue(null);

    await expect(getProfilePageData(USER_ID, AUTH_EMAIL)).rejects.toThrow(
      /Profile data incomplete after ensureProfileExists/,
    );
  });
});
