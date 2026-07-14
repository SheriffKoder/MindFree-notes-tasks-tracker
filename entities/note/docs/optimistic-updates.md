# Optimistic updates (and form snap)

Why list caches update immediately on edit — and why the open form must **not** blindly follow every cache write.

**Workflow detail:** `app/development/workflow/notes/substeps/optimistic-snap-fixes.md`  
**Realtime form gate:** [realtime.md](./realtime.md)

---

## Two layers

| Layer | Role |
| ----- | ---- |
| **TanStack note caches** | Source of truth for cards, calendar cells, Home strip |
| **Drawer form local state** | Source of truth for what the user is typing right now |

Optimistic `onMutate` patches caches so the UI outside the inputs feels instant. The form keeps its own `values` until a **controlled** remote sync is allowed.

---

## Stale PATCH `onSuccess` (cache layer)

Slow networks can complete an older PATCH after a newer optimistic row exists. Reconciling blindly snaps cards backward.

**Mitigation (done):** skip `onSuccess` cache write when `!isRemoteNoteNewer(serverNote, cached)` — same timestamp idea as realtime.

Timestamp-only compare can still admit edge cases when server time outruns optimistic client stamps; content-generation gates remain optional hardening.

---

## Form reset on cache write (form layer)

Once `remoteSyncKey >= 1`, an effect that depended on `note` re-ran `setValues(noteToFormValues(note))` on **every** cache update — including the user’s own optimistic patches → typing rollback.

**Mitigation (done):**

- Remote-sync effect depends **only** on `remoteSyncKey` bump; read `note` from refs at bump time
- Reset `remoteSyncKey` to `0` when drawer opens / context `resetKey` changes

**Still hardening (workflow):** synchronous dirty publish into the editor sync guard; stable orchestrator `handleChange` identity when `note` reference churns.

---

## Principle

> Optimistic cache updates are good. Treating the cached `Note` prop as the live form model while the user is dirty is not.

Remote wins into the form only when idle and allowed (`shouldSyncRemoteIntoForm`).

---

## Related

| Doc | Why |
| --- | --- |
| [writes-and-autosave.md](./writes-and-autosave.md) | Where optimistic mutate runs |
| [ADR 0008](../../../docs/adr/0008-realtime-postgres-changes.md) | Remote updates into cache/form |
| [state-management.md](../../../docs/architecture/state-management.md) | Ephemeral vs server state |
