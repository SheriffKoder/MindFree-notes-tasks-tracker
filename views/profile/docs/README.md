# Profile view docs

View-layer documentation for `/profile` — page shell and section composition.
Domain rules live under [`entities/profile/docs/`](../../../entities/profile/docs/).
Theme paint lives under [`features/profile/apply-theme/`](../../../features/profile/apply-theme/README.md).

| Doc | Topic |
| --- | ----- |
| [sections.md](./sections.md) | Split forms: each section owns draft + mutation |

**Route:** `app/(app)/profile/page.tsx` → `ProfileClient` from `@/views/profile`  
**Entrypoint:** `views/profile/index.tsx` → `ui/profile-client.tsx`

---

## Page composition

The page is a thin client shell:

1. Shared page header (`text-h2` + `page-header__subtitle`)
2. Scrollable column of **four feature sections**
3. Separators via `.section-divider` (`<hr>`) — **no** section background cards

```text
ProfileClient
  ├── header
  ├── AccountSection
  ├── hr.section-divider + ThemeSection
  ├── hr.section-divider + AppLockSection
  └── hr.section-divider + ExportSection
```

Styling tokens: `app/globals.css` (`.page-header`, `.section-divider`). Product
rule: divider lines only; do not wrap sections in `app-card` / bordered panels.

Preferences for theme are **not** hydrated only here — `(app)/layout` seeds the
profile cache app-wide so Home/Notes already match saved theme. The Profile page
reads the same TanStack cache via each section’s `useProfilePageQuery`.

Demo users (`DEMO_LOGIN_EMAIL`) never reach this page (proxy + page redirect).

---

## Related

- [sections.md](./sections.md) — who owns form state
- [entities/profile/docs/](../../../entities/profile/docs/) — tables, seeding, APIs
- [user-session-and-preferences.md](../../../docs/architecture/user-session-and-preferences.md)
- [app-lock.md](../../../docs/architecture/app-lock.md)
