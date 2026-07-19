# Note drawer feature (`features/notes/note-drawer`)

Notes-specific **drawer island** — composes the shared drawer shell, the entity editor form, cache lookup, and calendar day navigation. Import from `@/features/notes/note-drawer`.

**Where to look by responsibility:** [`RESPONSIBILITIES.md`](./RESPONSIBILITIES.md)  
**WHY (save interceptor):** [`docs/pre-save-orchestrator.md`](./docs/pre-save-orchestrator.md)

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
│   └── find-note-in-cache.ts# Convenience re-export of entity cache lookup helpers
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
| Pure date helpers and the feature convenience re-export of entity cache lookup helpers | `lib/*` |

## This feature is not responsible for

| Concern | Owner |
| ------- | ----- |
| Form fields, validation, toggles, textarea UI | `entities/note/editor` |
| Drawer open/close API and `NoteEditorRequest` | `views/notes/model/editor/` |
| Generic drawer shell (overlay, panel, close button) | `shared/drawer` |
| Query keys, HTTP fetchers, query options, and prefetch | `entities/note/client/` |
| Read, mutation, and realtime hooks | `entities/note/hooks/` |
| Cache lookup, updates, synchronization, and realtime apply | `entities/note/cache/` |
| SSR cache seeders | `entities/note/hydration/` |
| Page URL `month` / `view` or calendar grid highlight | `views/notes` |
| PATCH / create / delete execution | Server write use-cases in `entities/note/mutations/`, HTTP fetchers in `entities/note/client/`, and mutation hooks in `entities/note/hooks/`; wired by this feature |

## `lib/` vs `model/` — why both?

Same split as the entity, but scoped to drawer behavior:

| Folder | Contains | Examples |
| ------ | -------- | -------- |
| `lib/` | Pure feature helpers plus convenience re-exports of entity cache lookup helpers | `shiftIsoDate`, `findNoteByIdInCache` |
| `model/` | React hooks — state, effects, TanStack subscriptions | `useDrawerActiveDate`, `useResolvedDrawerNote` |

**Rule of thumb:** if drawer behavior needs `useState`, `useEffect`, or `useQuery`, it goes in `model/`. Pure drawer transforms go in `lib/`; `lib/find-note-in-cache.ts` is only a feature convenience re-export from `entities/note/cache/`, where cache lookup is owned.

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
entities/note/cache    ←  lib/find-note-in-cache.ts (convenience re-export)
views/notes/model/editor  ←  ui/note-drawer.tsx (UseNotesDrawerResult type only)
```

- This feature imports from `entities/note/editor`, `entities/note/client`, and the entity cache lookup surface.
- The entity editor does **not** import from this feature.
- Page views import this feature's public `NoteDrawer` component.

## Future additions (Step 11+)

```text
features/notes/note-drawer/pre-save-orchestrator/
├── evaluate-note-save.ts           # check-after-check pipeline
├── use-pre-save-orchestrator.ts    # refs, debounce, entity mutation-hook calls
└── types.ts
```

Server write use-cases belong in `entities/note/mutations/`; HTTP fetchers, mutation hooks, and cache updates belong in `entities/note/client/`, `entities/note/hooks/`, and `entities/note/cache/`. This folder owns interpretation and when saves run.

## See also

- Entity editor form: `entities/note/README.md` → `editor/`
- Page drawer intent: `views/notes/model/editor/note-editor-request.ts`
- Product rules: `app/development/plans/02-notes-page.md` → Drawer Navigation Decisions
