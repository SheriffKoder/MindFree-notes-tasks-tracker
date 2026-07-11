# Note drawer feature (`features/notes/note-drawer`)

Notes-specific **drawer island** — composes the shared drawer shell, the entity editor form, cache lookup, and calendar day navigation. Import from `@/features/notes/note-drawer`.

## How this relates to the entity editor

| Layer | Folder | Responsibility |
| ----- | ------ | -------------- |
| Page | `views/notes/model/editor/` | Open/close drawer, `NoteEditorRequest` (edit id, create for date, create general) |
| Feature | `features/notes/note-drawer/` | Drawer island — shell, cache reads, date nav, footer, prefetch |
| Entity | `entities/note/editor/` | Reusable form — fields, validation, local dirty state, form UI |

```text
NotesClient
  useNotesDrawer()          ← views: "open edit", "open create for date"
       ↓
  <NoteDrawer drawer={…} /> ← feature: island orchestration
       ↓
  <NoteForm note={…} />     ← entity: controlled form only
```

The entity editor answers: **"How do I edit one note's fields?"**

This feature answers: **"How does the Notes page drawer show, navigate, and resolve notes?"**

## Entry point

| File | Exports |
| ---- | ------- |
| `index.ts` | `NoteDrawer`, hooks (for tests or advanced wiring) |

## Folder layout

```text
features/notes/note-drawer/
├── README.md
├── index.ts
├── lib/                     # Pure helpers — no React, no I/O
│   ├── shift-iso-date.ts    # ±1 day on YYYY-MM-DD
│   ├── month-of-iso-date.ts # YYYY-MM from ISO date
│   └── find-note-in-cache.ts# Lookup note by id across TanStack caches
├── model/                   # Drawer-specific React hooks
│   ├── use-drawer-active-date.ts
│   ├── use-resolved-drawer-note.ts
│   ├── use-drawer-date-navigation.ts
│   └── use-drawer-month-prefetch.ts
└── ui/
    ├── note-drawer.tsx      # Public island — AppDrawer + NoteForm + footer
    └── note-drawer-footer.tsx
```

## This feature is responsible for

| Concern | Location |
| ------- | -------- |
| Composing `AppDrawer` + `NoteForm` + thin footer | `ui/note-drawer.tsx` |
| Resolving which `Note` to pass to the form (cache only, no GET on open) | `model/use-resolved-drawer-note.ts` |
| Drawer `activeDate` — source of truth for calendar day browsing | `model/use-drawer-active-date.ts` |
| Prev/next day buttons and horizontal swipe | `model/use-drawer-date-navigation.ts` |
| Prefetching ±1 month when `activeDate` hits a month boundary | `model/use-drawer-month-prefetch.ts` |
| Footer layout — arrows left, last-edited right | `ui/note-drawer-footer.tsx` |
| Pure date/cache helpers used by the hooks above | `lib/*` |

## This feature is not responsible for

| Concern | Owner |
| ------- | ----- |
| Form fields, validation, toggles, textarea UI | `entities/note/editor` |
| Drawer open/close API and `NoteEditorRequest` | `views/notes/model/editor/` |
| Generic drawer shell (overlay, panel, close button) | `shared/drawer` |
| TanStack query keys, fetchers, SSR hydration | `entities/note/client` / `entities/note/server` |
| Page URL `month` / `view` or calendar grid highlight | `views/notes` |
| PATCH / create mutations | `entities/note/mutations/` (Step 9–10), wired here |

## `lib/` vs `model/` — why both?

Same split as the entity, but scoped to drawer behavior:

| Folder | Contains | Examples |
| ------ | -------- | -------- |
| `lib/` | Pure functions — testable without React | `shiftIsoDate`, `findNoteByIdInCache` |
| `model/` | React hooks — state, effects, TanStack subscriptions | `useDrawerActiveDate`, `useResolvedDrawerNote` |

**Rule of thumb:** if it needs `useState`, `useEffect`, or `useQuery`, it goes in `model/`. If it is a pure transform or cache read, it goes in `lib/`.

Compare with `entities/note/editor/`:

| | `entities/note/editor/lib/` | `entities/note/editor/model/` | `features/notes/note-drawer/lib/` | `features/notes/note-drawer/model/` |
| --- | --- | --- | --- | --- |
| **Scope** | Form display and layout | Form field state and schema | Drawer date/cache helpers | Drawer navigation and cache hooks |
| **Example** | `formatNoteLastEditedAt` | `useNoteForm` | `shiftIsoDate` | `useDrawerDateNavigation` |

## Cache resolution rules

No network call when the drawer opens — reads TanStack cache only.

| Drawer context | Cache key | Lookup |
| -------------- | --------- | ------ |
| Calendar date mode (`activeDate` set) | `["calendarNotes", monthOf(activeDate)]` | Note where `note.date === activeDate`, or `null` (empty draft) |
| General edit (`mode: "edit"`, no date nav) | `["generalNotes"]` | Note by `noteId` |

Drawer `activeDate` navigation does **not** update page URL `month` or page calendar highlight.

## Date navigation eligibility

| Open path | Date nav (arrows + swipe) |
| --------- | ------------------------- |
| `openCreateForDate(date)` | enabled |
| `openEdit(id)` on calendar note | enabled |
| `openEdit(id)` on general note | disabled |
| `openCreateGeneral()` | disabled |

## Dependency direction

```text
shared/drawer          ←  ui/note-drawer.tsx
entities/note/editor   ←  ui/note-drawer.tsx
entities/note/client   ←  model/use-resolved-drawer-note.ts
                       ←  model/use-drawer-month-prefetch.ts
views/notes/model/editor  ←  ui/note-drawer.tsx (UseNotesDrawerResult type only)
```

- This feature imports from `entities/note/editor` and `entities/note/client`.
- The entity editor does **not** import from this feature.
- Page views import this feature's public `NoteDrawer` component.

## Future additions (Steps 9–10)

```text
features/notes/note-drawer/
└── model/
    ├── use-note-drawer-autosave.ts   # debounced PATCH autosave (Step 9)
    └── use-note-drawer-mutations.ts  # lazy create — Step 10
```

Mutation implementations belong in `entities/note/mutations/`; this feature owns when and how they run inside the drawer island.

## See also

- Entity editor form: `entities/note/README.md` → `editor/`
- Page drawer intent: `views/notes/model/editor/note-editor-request.ts`
- Product rules: `app/development/plans/02-notes-page.md` → Drawer Navigation Decisions
