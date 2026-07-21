# Profile sections (split forms)

`ProfileClient` only **composes**. Each section is a feature that owns its own
draft UI state and wires saves to an entity mutation / fetch. Sections do not
import each other.

```text
views/profile          → layout + dividers
features/profile/*     → forms + local drafts
entities/profile       → schemas, API fetchers, TanStack mutations
```

---

## Sections

| Section | Feature path | Local model | Persist via |
| --- | --- | --- | --- |
| Account | `features/profile/account-section/` | `use-update-display-name.ts` | `useUpdateProfileMutation` → `PATCH /api/profile/account` |
| Theme | `features/profile/theme-section/` | `use-update-theme-preferences.ts` | `useUpdatePreferencesMutation` → `PATCH /api/profile/preferences` |
| App lock | `features/profile/app-lock-section/` | `use-app-lock-settings.ts` | `useUpdateAppLockMutation` → `PATCH /api/profile/security` |
| Export | `features/profile/export-section/` | `use-export-data.ts` | prefs PATCH for email; `fetchProfileExport` → `POST /api/profile/export` |

Each section:

1. Reads `ProfilePageData` (or a slice) via `useProfilePageQuery`
2. Keeps dirty draft state in the feature hook (not in the view)
3. Validates lightly in the UI; server Zod schemas are authoritative
4. Surfaces pending / error / success inline

Public barrels: each feature’s `index.ts` exports the section component only.

---

## Theme section vs apply-theme

| Concern | Owner |
| --- | --- |
| Editing mode / accent / custom fields on Profile | `theme-section` |
| Painting CSS vars + next-themes **everywhere** | `apply-theme` (`ProfileThemeApplier` in layout) |

Saving theme prefs updates the TanStack cache; `ProfileThemeApplier` reacts and
repaints. Do not call `setTheme` / CSS var helpers from the theme form itself
beyond what the shared mutation + applier already do.

---

## App lock section vs gate

| Concern | Owner |
| --- | --- |
| Enable / change / disable on Profile | `app-lock-section` |
| Full-screen unlock when locked | `features/app-lock` (`AppLockGate`) |

See [docs/architecture/app-lock.md](../../../docs/architecture/app-lock.md).

---

## Export

- Editable `exportEmail` (defaults to auth email at seed).
- “Export data” downloads one `.xlsx` (Notes, Tasks, Reminders, Records sheets).
- Email delivery is **not** wired yet — destination is stored for later; download is immediate.

---

## Adding a section

1. New `features/profile/<name>-section/` with `ui/`, `model/`, `index.ts`
2. Mount in `views/profile/ui/profile-client.tsx` behind a `.section-divider`
3. Prefer an existing entity mutation; add API + schema only if needed
4. Keep the view free of form drafts and fetch details
