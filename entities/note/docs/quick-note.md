# Quick note

The Home **quick slot** — one undated capture note **per category** that never appears on the Notes page lists.

**Domain:** [domain-model.md](./domain-model.md)  
**Home consumer:** [views/home/docs/notes-strip.md](../../../views/home/docs/notes-strip.md)  
**Rules live in:** `evaluateNoteSave` / `applyQuickSlotRules`

---

## Why it exists

Home needs “write something now” without picking a calendar day or inventing an undated title. That is a **role** of a note (`isQuick`), not a second table. Categories each get their own slot so Diary capture does not collide with Projects.

Constraints:

- `date IS NULL`, `category_id` set, and `is_quick = true`
- At most one per user **per category** (DB partial unique index `mf_notes_user_category_quick_unique`)
- Excluded from `GET /api/notes/general` and Notes page views
- Shown first in that category’s Home strip (`strip.quickNote`)

---

## Create

- Empty slot → placeholder; first meaningful **content** → `create-quick` for that strip’s `categoryId` (lazy).
- Home header **Add note** opens `create-general` instead — it must not fight the per-category unique slot.
- If the user sets a **title** or **date** while still in create-quick context, the pipeline creates an **undated** / **calendar** note instead (graduates out of the slot intent) and keeps those fields.

---

## While quick

Invariants applied on save:

- Title forced empty (content-first capture)
- `date` null, `isQuick` true, `categoryId` unchanged
- Star / important toggles hidden in the form (UI); promote path clears those flags

---

## Graduate (leave the slot)

An existing quick note leaves `isQuick` when:

- A **date** becomes bound, or
- The user enters a non-empty **title**

Then it becomes a normal undated (same category) or calendar note and can show on Notes / starred like any other.

---

## Promote (enter the slot)

House-plus on a persisted non-quick note:

- Sets `isQuick: true`
- Clears title, date, starred, important (slot is a blank capture surface again)
- Stays in / moves into the target category’s unique quick slot

Implemented as an immediate patch path through the orchestrator (`promoteToQuick`), not a separate entity.

---

## Cache / sync

Home membership is updated by `synchronizeNoteCaches` (that strip’s quick slot + starred list). Realtime and offline flush use the same hub so Home does not maintain a private write pipeline.

---

## Related

| Doc | Why |
| --- | --- |
| [writes-and-autosave.md](./writes-and-autosave.md) | Actions including `create-quick` |
| [read-models.md](./read-models.md) | `["homeNotes"]` strips shape |
| [ADR 0010](../../../docs/adr/0010-one-domain-multiple-consumers.md) | One domain, multiple consumers |
| [ADR 0017](../../../docs/adr/0017-note-categories.md) | One quick per category |
