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

Optimistic `onMutate` patches caches so the UI outside the inputs feels instant. The form keeps its own `values` until a **controlled** remote sync is allowed. Optimistic merges may bump `lastEditedAt` for sort UX but **never** increment `revision` — that advances only on the server.

---

## Stale PATCH `onSuccess` (cache layer)

Slow networks can complete an older PATCH after a newer server revision is already
in cache. Reconciling blindly snaps cards backward.

**Mitigation (done):** skip `onSuccess` cache write when
`!isRemoteNoteNewer(serverNote, cached)` — compares monotonic `revision`, not
`lastEditedAt`. Optimistic merges may bump `lastEditedAt` for list sort only;
they never advance `revision`.

---

## Form reset on cache write (form layer)

Once `formReloadKey >= 1`, an effect that depended on `note` re-ran `setValues(noteToFormValues(note))` on **every** cache update — including the user’s own optimistic patches → typing rollback.

**Mitigation (done):**

- Form-reload effect depends **only** on `formReloadKey` bump; read `note` from refs at bump time
- Reset `formReloadKey` to `0` when drawer opens / context `resetKey` changes

**Still hardening (workflow):** stable orchestrator `handleChange` identity when `note` reference churns.

---

## Principle

> Optimistic cache updates are good. Treating the cached `Note` prop as the live form model while the user is dirty is not.

Remote wins into the form when the drawer is **clean** (`shouldSyncRemoteIntoForm`).
Dirty drawers keep local fields and show an “Updated on another device” banner
(Reload / Keep editing). There is **no typing gate** — users may keep editing
local fields until they choose Reload.

---

## Version axis (mental model)

| State | Role |
| ----- | ---- |
| `confirmedRevision` | Last server-confirmed revision the open form is based on |
| `isDirty` | Local fields differ from last committed snapshot |
| `pendingRemoteRevision` | Newer remote revision arrived while dirty (banner) |
| Mutation pending | Skip own realtime echo while PATCH is in flight |

PATCH sends `expectedRevision`; server returns `409 STALE_WRITE` + current note
when the client is behind. Lists and cards use `revision` newer-wins; form pull
uses the drawer sync guard above.

---

## Related

| Doc | Why |
| --- | --- |
| [writes-and-autosave.md](./writes-and-autosave.md) | Where optimistic mutate runs |
| [ADR 0008](../../../docs/adr/0008-realtime-postgres-changes.md) | Remote updates into cache/form |
| [state-management.md](../../../docs/architecture/state-management.md) | Ephemeral vs server state |
