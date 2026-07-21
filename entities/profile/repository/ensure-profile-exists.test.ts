/**
 * @file entities/profile/repository/ensure-profile-exists.test.ts
 * Unit tests for idempotent lazy profile seeding.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

const upsert = vi.fn();
const from = vi.fn();

vi.mock("@/shared/lib/supabase/server", () => ({
  createClient: async () => ({ from }),
}));

import { ensureProfileExists } from "@/entities/profile/repository/ensure-profile-exists";
import {
  PROFILES_TABLE,
  USER_PREFERENCES_TABLE,
  USER_SECURITY_SETTINGS_TABLE,
} from "@/shared/config/supabase-tables";

const USER_ID = "user-1";
const EMAIL = "user@example.com";

describe("ensureProfileExists", () => {
  beforeEach(() => {
    upsert.mockReset();
    from.mockReset();
    upsert.mockResolvedValue({ error: null });
    from.mockImplementation(() => ({ upsert }));
  });

  it("upserts all three default rows with ignoreDuplicates", async () => {
    await ensureProfileExists(USER_ID, EMAIL);

    expect(from).toHaveBeenCalledWith(PROFILES_TABLE);
    expect(from).toHaveBeenCalledWith(USER_PREFERENCES_TABLE);
    expect(from).toHaveBeenCalledWith(USER_SECURITY_SETTINGS_TABLE);
    expect(upsert).toHaveBeenCalledTimes(3);

    expect(upsert).toHaveBeenCalledWith(
      {
        id: USER_ID,
        display_name: "",
        email: EMAIL,
      },
      { onConflict: "id", ignoreDuplicates: true },
    );
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: USER_ID,
        theme_mode: "dark",
        export_email: EMAIL,
        accent_color: null,
      }),
      { onConflict: "user_id", ignoreDuplicates: true },
    );
    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: USER_ID,
        app_lock_enabled: false,
        app_password_hash: null,
      },
      { onConflict: "user_id", ignoreDuplicates: true },
    );
  });

  it("can be called twice without throwing", async () => {
    await expect(
      ensureProfileExists(USER_ID, EMAIL),
    ).resolves.toBeUndefined();
    await expect(
      ensureProfileExists(USER_ID, EMAIL),
    ).resolves.toBeUndefined();

    expect(upsert).toHaveBeenCalledTimes(6);
  });

  it("throws when a seed upsert fails", async () => {
    upsert
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: { message: "db down" } })
      .mockResolvedValueOnce({ error: null });

    await expect(ensureProfileExists(USER_ID, EMAIL)).rejects.toThrow(
      /Failed to ensure preferences row: db down/,
    );
  });
});
