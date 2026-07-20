/**
 * @file entities/profile/repository/update-preferences-row.ts
 * Partial update for `mf_user_preferences`.
 */

import { mapPreferencesRow } from "@/entities/profile/lib/map-row";
import type {
  UserPreferences,
  UserPreferencesRow,
} from "@/entities/profile/model/types";
import type { UpdatePreferencesBody } from "@/entities/profile/schema";
import { USER_PREFERENCES_TABLE } from "@/shared/config/supabase-tables";
import { createClient } from "@/shared/lib/supabase/server";

/**
 * Applies a partial preferences patch for the owned row.
 *
 * @param userId - authenticated user id
 * @param patch - validated camelCase preference fields
 * @returns updated preferences, or `null` when no row matches
 */
export async function updatePreferencesByUserId(
  userId: string,
  patch: UpdatePreferencesBody,
): Promise<UserPreferences | null> {
  const supabase = await createClient();

  const dbPatch: Partial<
    Pick<
      UserPreferencesRow,
      | "theme_mode"
      | "background_color"
      | "background_image_url"
      | "drawer_background_color"
      | "drawer_background_opacity"
      | "text_contrast_mode"
      | "accent_color"
      | "export_email"
    >
  > = {};

  if (patch.themeMode !== undefined) {
    dbPatch.theme_mode = patch.themeMode;
  }
  if (patch.backgroundColor !== undefined) {
    dbPatch.background_color = patch.backgroundColor;
  }
  if (patch.backgroundImageUrl !== undefined) {
    dbPatch.background_image_url = patch.backgroundImageUrl;
  }
  if (patch.drawerBackgroundColor !== undefined) {
    dbPatch.drawer_background_color = patch.drawerBackgroundColor;
  }
  if (patch.drawerBackgroundOpacity !== undefined) {
    dbPatch.drawer_background_opacity = patch.drawerBackgroundOpacity;
  }
  if (patch.textContrastMode !== undefined) {
    dbPatch.text_contrast_mode = patch.textContrastMode;
  }
  if (patch.accentColor !== undefined) {
    dbPatch.accent_color = patch.accentColor;
  }
  if (patch.exportEmail !== undefined) {
    dbPatch.export_email = patch.exportEmail;
  }

  const { data, error } = await supabase
    .from(USER_PREFERENCES_TABLE)
    .update(dbPatch)
    .eq("user_id", userId)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to update preferences: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return mapPreferencesRow(data as UserPreferencesRow);
}
