# Quick note

The Home **quick slot** — one undated capture note per user that never appears on the Notes page lists.

**Domain:** [domain-model.md](./domain-model.md)  
**Home consumer:** [views/home/docs/notes-strip.md](../../../views/home/docs/notes-strip.md)  
**Rules live in:** `evaluateNoteSave` / `applyQuickSlotRules`

---

## Why it exists

Home needs “write something now” without picking a calendar day or inventing a general note title. That is a **role** of a note (`isQuick`), not a second table.

Constraints:

- `date IS NULL` and `is_quick = true`
- At most one per user (DB partial unique index)
- Excluded from `GET /api/notes/general` and Notes page views
- Shown first in the Home strip (`homeNotes.quickNote`)

---

## Create

- Empty slot → placeholder; first meaningful **content** → `create-quick` (lazy).
- If the user sets a **title** while still in create-quick context, the pipeline creates a **general** note instead (graduates out of the slot intent).

---

## While quick

Invariants applied on save:

- Title forced empty (content-first capture)
- `date` null, `isQuick` true
- Star / important toggles hidden in the form (UI); promote path clears those flags

---

## Graduate (leave the slot)

An existing quick note leaves `isQuick` when:

- A **date** becomes bound, or
- The user enters a non-empty **title**

Then it becomes a normal general or calendar note and can show on Notes / starred like any other.

---

## Promote (enter the slot)

House-plus on a persisted non-quick note:

- Sets `isQuick: true`
- Clears title, date, starred, important (slot is a blank capture surface again)

Implemented as an immediate patch path through the orchestrator (`promoteToQuick`), not a separate entity.

---

## Cache / sync

Home membership is updated by `synchronizeNoteCaches` (quick slot + starred list). Realtime and offline flush use the same hub so Home does not maintain a private write pipeline.

---

## Related

| Doc | Why |
| --- | --- |
| [writes-and-autosave.md](./writes-and-autosave.md) | Actions including `create-quick` |
| [read-models.md](./read-models.md) | `["homeNotes"]` shape |
| [ADR 0010](../../../docs/adr/0010-one-domain-multiple-consumers.md) | One domain, multiple consumers |
