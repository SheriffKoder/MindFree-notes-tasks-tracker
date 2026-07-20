/**
 * @file features/profile/theme-section/ui/theme-section.tsx
 * Profile theme section — mode, accent (all modes), and custom fields.
 */

"use client";

import {
  useProfilePageQuery,
  type ProfilePreferences,
  type TextContrastMode,
  type ThemeMode,
} from "@/entities/profile/client";
import { AccentColorField } from "@/features/profile/theme-section/ui/accent-color-field";
import { CustomThemeFields } from "@/features/profile/theme-section/ui/custom-theme-fields";
import { ThemeModePicker } from "@/features/profile/theme-section/ui/theme-mode-picker";
import { useUpdateThemePreferences } from "@/features/profile/theme-section/model/use-update-theme-preferences";
import { QueryStatePanel } from "@/shared/react-query";

/**
 * Renders the Theme section for the Profile page.
 */
export function ThemeSection() {
  const query = useProfilePageQuery();

  if (query.isPending && !query.data) {
    return <QueryStatePanel message="Loading theme…" variant="loading" />;
  }

  if (query.isError || !query.data) {
    return (
      <QueryStatePanel
        message={
          query.error instanceof Error
            ? query.error.message
            : "Couldn’t load theme preferences. Try refreshing the page."
        }
        variant="error"
      />
    );
  }

  return <ThemeSectionForm preferences={query.data.preferences} />;
}

function ThemeSectionForm({
  preferences,
}: {
  preferences: ProfilePreferences;
}) {
  const { errorMessage, updatePreferences } = useUpdateThemePreferences();

  function handleThemeModeChange(themeMode: ThemeMode) {
    updatePreferences(
      { themeMode },
      {
        themeMode,
        textContrastMode: preferences.textContrastMode,
      },
    );
  }

  function handleAccentChange(accentColor: string | null) {
    updatePreferences({ accentColor });
  }

  function handleTextContrastModeChange(textContrastMode: TextContrastMode) {
    updatePreferences(
      { textContrastMode },
      {
        themeMode: preferences.themeMode,
        textContrastMode,
      },
    );
  }

  return (
    <section
      aria-labelledby="profile-section-theme"
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2">
        <h3
          className="text-lg font-semibold [color:var(--color-fg)]"
          id="profile-section-theme"
        >
          Theme
        </h3>
        <p className="text-sm [color:var(--color-fg-muted)]">
          Light, dark, and custom appearance preferences.
        </p>
      </div>

      <div className="flex max-w-md flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium [color:var(--color-fg)]">Mode</p>
          <ThemeModePicker
            value={preferences.themeMode}
            onChange={handleThemeModeChange}
          />
        </div>

        <AccentColorField
          value={preferences.accentColor}
          onChange={handleAccentChange}
        />

        {preferences.themeMode === "custom" ? (
          <>
            <hr className="section-divider" />
            <CustomThemeFields
              preferences={preferences}
              onBackgroundColorChange={(backgroundColor) =>
                updatePreferences({ backgroundColor })
              }
              onBackgroundImageUrlChange={(backgroundImageUrl) =>
                updatePreferences({ backgroundImageUrl })
              }
              onDrawerBackgroundColorChange={(drawerBackgroundColor) =>
                updatePreferences({ drawerBackgroundColor })
              }
              onDrawerBackgroundOpacityChange={(drawerBackgroundOpacity) =>
                updatePreferences({ drawerBackgroundOpacity })
              }
              onTextContrastModeChange={handleTextContrastModeChange}
            />
          </>
        ) : null}

        {errorMessage ? (
          <p className="text-caption [color:var(--color-error)]" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
}
