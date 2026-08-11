# Note drawer — where to look

Short map by business responsibility. Paths are relative to `features/notes/note-drawer/`.

Drawer open/close and `NoteEditorRequest` live in `views/notes/model/editor/`.  
Form fields and validation live in `entities/note/editor/`.

---

## Entry points

`index.ts` — `NoteDrawer`, footer, drawer hooks (public API)  
`pre-save-orchestrator/index.ts` — `usePreSaveOrchestrator`, `evaluateNoteSave`, pipeline types

---

## UI shell

`ui/note-drawer.tsx` — composes `AppDrawer` + `NoteForm` + footer; wires orchestrator, date nav, realtime hook  
`ui/note-drawer-footer.tsx` — prev/next day arrows, conflict Replace prompt, remote Reload/Keep banner, last-edited / save status

---

## Cache resolution

`model/use-resolved-drawer-note.ts` — resolves `Note | null` from TanStack cache (edit by id, date mode by `activeDate`)  
`lib/find-note-in-cache.ts` — feature convenience re-export of `findNoteByIdInCache` and `findNoteOnDateInCache`; lookup ownership remains in `entities/note/cache/`

---

## Date navigation

`model/use-drawer-active-date.ts` — drawer `activeDate` state, date-nav eligibility from open request  
`model/use-drawer-date-navigation.ts` — prev/next day handlers  
`model/use-drawer-month-prefetch.ts` — prefetch ±1 month when `activeDate` hits month edge  
`lib/shift-iso-date.ts` — add/subtract days on `YYYY-MM-DD`  
`lib/month-of-iso-date.ts` — `YYYY-MM` from ISO date

---

## Pre-save orchestrator

`pre-save-orchestrator/evaluate-note-save.ts` — pure pipeline: resolve date, normalize title, conflict gate, save action

`pre-save-orchestrator/use-pre-save-orchestrator.ts` — refs, debounce, entity mutation hooks, conflict UI state, `reevaluateFromCache`

`pre-save-orchestrator/types.ts` — pipeline input/output, `NoteSaveAction`, hook contracts

`pre-save-orchestrator/README.md` — orchestrator flow, entity touchpoints, why this approach

---

## Realtime (drawer side)

`model/use-note-drawer-realtime-sync.ts` — synchronous dirty publish, pending remote banner, bumps orchestrator `formReloadKey` on clean pull  
`model/note-confirmed-token-store.ts` — session store of server-confirmed `revision` per note id  
`model/note-editor-sync-guard.ts` — clean open drawer may pull remote fields; dirty never overwrites typing (no idle timer, no typing gate)  
`model/note-realtime-drawer-bridge.ts` — forwards page realtime events to the mounted drawer

**Sync policy:** clean → always pull remote into form; dirty → banner only (Reload / Keep editing); save while stale → server `409` + form reload.

Entity subscription hook: `entities/note/hooks/use-notes-realtime-sync.ts`

Entity cache application: `entities/note/cache/apply-realtime-note-change.ts`

---

## Quick lookup

| I need to… | Start here |
| ---------- | ---------- |
| Change drawer layout / what gets composed | `ui/note-drawer.tsx` |
| Change footer arrows or conflict banner | `ui/note-drawer-footer.tsx` |
| Fix which note loads in the drawer | `model/use-resolved-drawer-note.ts` |
| Fix prev/next day | `model/use-drawer-date-navigation.ts` |
| Fix when date nav is enabled | `model/use-drawer-active-date.ts` |
| Fix month prefetch on day nav | `model/use-drawer-month-prefetch.ts` |
| Change save routing (create vs patch vs delete) | `pre-save-orchestrator/evaluate-note-save.ts` |
| Change debounce / when autosave fires | `pre-save-orchestrator/use-pre-save-orchestrator.ts` |
| Fix same-day conflict UX | `pre-save-orchestrator/*`, `ui/note-drawer-footer.tsx` |
| Fix remote overwrite while typing | `model/note-editor-sync-guard.ts`, `model/use-note-drawer-realtime-sync.ts` |
| Fix dirty remote “Updated on another device” banner | `model/use-note-drawer-realtime-sync.ts`, `ui/note-drawer-footer.tsx` |
| Fix conflict banner after remote insert | `pre-save-orchestrator/use-pre-save-orchestrator.ts` (`reevaluateFromCache`) |
| Open drawer from page | `views/notes/model/editor/use-notes-drawer.ts` |
| Change form fields | `entities/note/editor/` |
| Change server PATCH/POST use-cases | `entities/note/mutations/` |
| Change HTTP PATCH/POST fetchers | `entities/note/client/patch-note.ts`, `entities/note/client/post-note.ts` |
| Change mutation hook behavior | `entities/note/hooks/use-update-note-mutation.ts`, `entities/note/hooks/use-create-*-mutation.ts` |
| Change optimistic/cache synchronization | `entities/note/cache/` |
