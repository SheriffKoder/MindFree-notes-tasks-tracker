# Pre-save orchestrator

Drawer save interpretation for Step 11 (date ↔ general cycle). One folder owns every rule that turns form values into a PATCH, POST, DELETE, or noop.

**Full plan:** `app/development/workflow/notes/date-general-cycle.md`

---

## Place in the form

The form is dumb. The orchestrator is the only interpreter.

```text
NoteDrawer (wiring only)
  │
  ├─ usePreSaveOrchestrator()     ← this folder
  │     handleChange, applyPickedDate, conflict UI state
  │
  └─ NoteForm (entities/note/editor)
        local fields only — title, content, starred, important
        onChange(values, meta)  →  handleChange
        onDatePick(isoDate)     →  applyPickedDate → returns formatted title
```

| Layer | Owns | Does not own |
| ----- | ---- | ------------ |
| `NoteForm` / `useNoteForm` | Field state, dirty/valid meta, calendar title prefill on open | Save routing, conflict checks, mutations |
| `usePreSaveOrchestrator` | Refs (`lastPickedDate`, `replaceConfirmed`), debounce, TanStack calls | Business rules (delegates to `evaluateNoteSave`) |
| `evaluateNoteSave` | Date resolve, normalize, conflict gate, action choice | React, network, cache |
| `entities/note/mutations` + API | Dumb apply of resolved payload | Interpreting title edits or picker intent |

**Picker wiring (intentionally thin):**

1. User picks a date → `NoteDatePickerTrigger` calls `onDatePick(isoDate)`.
2. Drawer calls `applyPickedDate(isoDate)` → records `lastPickedDate` ref, returns `formatCalendarNoteTitle(isoDate)`.
3. Form sets title locally. No save until the next `onChange` runs the pipeline.

**Footer wiring:**

- `effectiveDateNavEnabled` — day arrows/swipe on only when pipeline resolved a calendar date.
- `conflict` + `resolveReplace` / `resolveDismiss` — conflict banner; autosave stays blocked until user confirms replace or edits again.

---

## Files

| File | Role |
| ---- | ---- |
| `evaluate-note-save.ts` | Pure pipeline — check after check (resolve → normalize → gates → action) |
| `types.ts` | `EvaluateNoteSaveInput` / `EvaluateNoteSaveResult`, hook contracts |
| `use-pre-save-orchestrator.ts` | React glue — refs, debounce, TanStack mutations only |
| `index.ts` | Public export: `usePreSaveOrchestrator` |

---

## Steps (pipeline)

Single function: `evaluateNoteSave(input)` in `evaluate-note-save.ts`. Each step reads the previous result; early exit when a gate blocks save.

```text
onChange(values, meta)
  → evaluateNoteSave()
      │
      ├─ 1. resolveDate
      │     lastPickedDate + title match?  → bind picker date
      │     existing note.date + title match?  → bind note date
      │     lazy-create context + prefill title match?  → bind opening date
      │     else  → null (general)
      │
      ├─ 2. normalizePayload
      │     if date  → title = formatCalendarNoteTitle(date), payload.date set
      │     else  → payload.date = null
      │
      ├─ 3. validation gate
      │     !meta.isValid  → noop, saving disabled
      │
      ├─ 4. conflict gate
      │     scan cache for occupant on target day (exclude note.id)
      │     conflict && !replaceConfirmed  → noop, show banner, saving disabled
      │
      └─ 5. decideAction
            lazy create + meaningful content  → create-calendar | create-general
            existing + empty calendar content  → delete
            existing + dirty + valid  → patch
            else  → noop
  → if isSavingEnabled && action !== noop  → debounce → TanStack mutate
```

**Hook steps (`handleChange`):**

1. Run `evaluateNoteSave` — sync `effectiveDateNavEnabled`, `isSavingEnabled`, `conflict`.
2. Gate — skip scheduling when blocked (conflict) or action is `noop`.
3. `scheduleFromEvaluation` — enqueue debounced patch / create-calendar / create-general / delete.

---

## Harmless if removed

This folder is **drawer-island only**. Deleting `pre-save-orchestrator/` and restoring the old drawer mutation hook does **not** require reverting the entity layer.

Step 9–10 autosave still works with the old call shape:

```ts
patchNote({ note, values });
createCalendarNote({ date, values });
```

### Entity changes are optional add-ons

These files gained **backward-compatible** fields. Omitting `date` and `replaceExistingOnDate` behaves like before Step 11:

| Area | Files | What was added (optional) |
| ---- | ----- | ------------------------- |
| Schemas | `update-note.schema.ts`, `create-note.schema.ts` | `date`, `replaceExistingOnDate` on PATCH/POST bodies |
| Server use-cases | `update-note.ts`, `create-calendar-note.ts` | Conflict gate + replace-on-date branch |
| Repository | `note-repository.ts` | `findCalendarNoteByDate`, `replaceNoteOnDate` |
| Client fetchers | `patch-note.ts`, `post-note.ts` | Optional `date` / `replaceExistingOnDate` in JSON body |
| TanStack | `use-update-note-mutation.ts`, `use-create-calendar-note-mutation.ts` | Date-move optimistic path via `relocateNoteInCache` when `date` is sent |
| Cache | `note-cache-mutations.ts`, `patch-note-in-cache.ts` | `relocateNoteInCache`, date override in `mergeFormValuesIntoNote` |
| Editor (UI only) | `format-calendar-note-title.ts`, `types.ts`, `note-date-picker-trigger.tsx`, form title row / toggles | `isDateFormattedTitle`, `onDatePick`, dumb picker — no save rules |

**What actually breaks on revert:** wiring in `note-drawer.tsx` / `note-drawer-footer.tsx` (imports this hook, conflict banner, `onDatePick`). Not the TanStack hooks themselves.

**What you would restore:** a drawer-level mutation hook (formerly `use-note-drawer-mutations.ts` + `note-mutation-rules.ts`) and read-only or parallel-state date UX if you drop the orchestrator.

---

## What this solved (vs the previous plan)

The first Step 11 approach spread one concern across parallel state:

| Old piece | Problem |
| --------- | ------- |
| `assignedDate` | Second source of truth beside `title` |
| `titleSync` | One-off patches to avoid form resets |
| `activeDate` | Navigation target vs save target conflated |
| Picker | Conflict checks and nav sync inside UI |
| `useNoteDrawerMutations` | Create vs PATCH branching duplicated rules |

That caused races: saves firing before pick settled, ghost notes after moves, replace UI out of sync with server.

**This approach worked because:**

1. **Form is the contract** — title and content are what the user edits; the pipeline interprets them once per change.
2. **One check-after-check pipeline** — `evaluateNoteSave` is pure, testable, and owns every gate (date bind, conflict, action).
3. **Thin hook** — refs and debounce only; no duplicated rules in picker or `useNoteForm`.
4. **Server stays dumb** — hook sends `{ ...values, date?, replaceExistingOnDate? }`; repository applies it.
5. **Cache follows note id** — `relocateNoteInCache` strips by id from all buckets before upserting, so date moves do not leave ghosts.

**Deleted / absorbed:**

| Removed | Lives in |
| ------- | -------- |
| `model/use-note-drawer-mutations.ts` | `use-pre-save-orchestrator.ts` |
| `lib/note-mutation-rules.ts` | `evaluate-note-save.ts` |

---

## Outside this folder (thin wiring only)

- `note-drawer.tsx` — imports `usePreSaveOrchestrator`, passes `handleChange` / `onDatePick` / conflict props
- `note-drawer-footer.tsx` — conflict banner + day nav driven by orchestrator outputs
- `entities/note/editor/*` — editable fields + dumb picker; no save rules
- `entities/note/mutations/*` + API routes — dumb apply (see table above)
- `entities/note/tanstack/*` — mutations; date fields optional
