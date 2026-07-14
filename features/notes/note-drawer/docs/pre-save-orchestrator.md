# Pre-save orchestrator (WHY)

Why the drawer uses a single save interceptor instead of smart fields or fat mutations.

**Decision:** [ADR 0006](../../../../docs/adr/0006-pre-save-orchestrator.md)  
**HOW / pipeline steps:** [../pre-save-orchestrator/README.md](../pre-save-orchestrator/README.md)  
**Writes overview:** [entities/note/docs/writes-and-autosave.md](../../../../entities/note/docs/writes-and-autosave.md)

---

## Problem

Save intent depends on more than the current input values:

- Is this day empty or occupied?
- Is the title still the formatted calendar date, or did the user break that binding?
- Should this draft create, patch, delete, or wait?
- Is the user offline?

If each control (star, date picker, content) called mutations directly, those rules would duplicate and drift — especially once Home shared the same drawer.

---

## Decision in one picture

```text
NoteForm (dumb fields)
    onChange / onDatePick
        ↓
evaluateNoteSave (pure rules)
        ↓
usePreSaveOrchestrator (debounce, mutate, offline)
        ↓
entity mutations / offline adapter
        ↓
synchronizeNoteCaches
```

The form never chooses HTTP verbs. The API never re-parses picker title heuristics.

---

## What this buys

| Benefit | Consequence |
| ------- | ----------- |
| One place for date ↔ general ↔ quick rules | Change Cycle behavior without editing every mutation |
| Pure `evaluateNoteSave` | Unit-testable without React or network |
| Harmless if removed | Drawer-island only — entity layer survives a rollback |
| Shared by Notes + Home | No second Home save dialect |

---

## What it intentionally ignores

- Query key layout and SSR hydrate (architecture / caching)
- Realtime subscription wiring (entity realtime docs)
- Pixel layout of the drawer shell

Those stay outside so the orchestrator remains an **interpreter**, not an app framework.

---

## Related

| Doc | Why |
| --- | --- |
| [ADR 0005](../../../../docs/adr/0005-selected-date-not-selected-note.md) | Date-nav supplies `activeDate` into evaluation |
| [optimistic-updates.md](../../../../entities/note/docs/optimistic-updates.md) | Form local state vs cache after save |
| Feature file map | [../RESPONSIBILITIES.md](../RESPONSIBILITIES.md) |
