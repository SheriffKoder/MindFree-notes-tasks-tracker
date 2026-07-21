# Apply theme (`features/profile/apply-theme`)

Applies saved Profile preferences to the **entire protected app** — not only the
Profile page. Editing UI lives in `features/profile/theme-section/`; this feature
owns paint + FOUC prevention.

Cross-cutting context:
[user-session-and-preferences.md](../../../docs/architecture/user-session-and-preferences.md).

---

## Two entry points (do not mix)

| Import | Safe for | Exports |
| --- | --- | --- |
| `@/features/profile/apply-theme` | Client + shared pure helpers | `ProfileThemeApplier`, CSS helpers, theme storage |
| `@/features/profile/apply-theme/server` | RSC / server only | `ProfilePreferencesHydrationSeed` |

The server seed uses `next/server` / profile `server.ts`. Importing it from a
client barrel caused `next/headers` leaks — keep the split.

`ThemeBootScriptTag` is used from root `app/layout.tsx` (imports the script
string / tag UI directly).

---

## Runtime flow

```text
(app)/layout
  ├── ProfilePreferencesHydrationSeed   (server)
  │     → getProfilePageData → seed TanStack profile cache
  └── ProfileThemeApplier               (client)
        → useProfilePageQuery()
        → setTheme(light|dark)
        → applyCustomThemeVars(preferences)
        → writeThemePreferencesSnapshot(preferences)

Next visit, before React:
  app/layout <head>
    └── ThemeBootScriptTag
          → read mindfree-profile-theme from localStorage
          → set html class + --custom-* vars (no body image yet)
```

Body background image is applied only in `applyCustomThemeVars` after mount
(`document.body` is unreliable inside the `<head>` boot script).

---

## CSS / next-themes mapping

| Preference | Effect |
| --- | --- |
| `themeMode` light/dark | `next-themes` class = that mode |
| `themeMode` custom | class = `textContrastMode` |
| `accentColor` set | `.theme-custom` + `--custom-accent` / `--custom-accent-fg` (**all** modes) |
| custom + `backgroundColor` | `--custom-bg` |
| custom + drawer color/opacity | `--custom-drawer-bg` (`color-mix` when opacity &lt; 1) |
| custom + safe image URL | `body` background cover (after image probe) |

Hook: `app/globals.css` (`.theme-custom`). Unset vars fall through to light/dark
tokens.

Helpers:

- `lib/apply-custom-theme-vars.ts` — `applyCustomThemeVars`, `composeDrawerBackground`, clear helpers
- `lib/resolve-accent-foreground.ts` — readable fg on accent
- `lib/is-safe-image-url.ts` — http(s) only for background images
- `lib/theme-storage.ts` — snapshot read/write; keys `mindfree-profile-theme` + `theme`
- `lib/theme-boot-script.ts` — string for the blocking inline script

---

## Mount sites

| Site | What |
| --- | --- |
| `app/(app)/layout.tsx` | Suspense + `ProfilePreferencesHydrationSeed`; `ProfileThemeApplier` |
| `app/layout.tsx` | `ThemeProvider` (`defaultTheme="dark"`, `enableSystem={false}`); `ThemeBootScriptTag` in `<head>` |

Home no longer mounts a ThemeSwitcher — Profile is the control surface.

---

## File map

```text
features/profile/apply-theme/
├── index.ts                 # client-safe barrel
├── server.ts                # ProfilePreferencesHydrationSeed only
├── lib/
│   ├── apply-custom-theme-vars.ts
│   ├── compose-drawer-background.test.ts
│   ├── is-safe-image-url.ts
│   ├── resolve-accent-foreground.ts
│   ├── theme-boot-script.ts
│   ├── theme-storage.ts
│   └── theme-storage.test.ts
└── ui/
    ├── profile-theme-applier.tsx
    ├── profile-preferences-hydration-seed.tsx
    └── theme-boot-script-tag.tsx
```

---

## Checklist when changing theme behavior

1. Update DB defaults? → `default-profile-values.ts` **and** `006_profile.sql`
2. New CSS var? → `globals.css` `.theme-custom`, applier clear list, boot script
3. Keep client/server barrels separate
4. After prefs save, applier should repaint from TanStack cache without a full reload
5. Hard refresh should not flash the wrong mode (boot script + `defaultTheme="dark"`)
