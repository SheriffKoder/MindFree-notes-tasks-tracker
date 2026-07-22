# Writes and autosave

How Payments decide **what** to write (create / patch / delete / noop) and how
that reaches the server and month caches.

**Decision (pure):** `features/payments/payment-drawer/pre-save-orchestrator/evaluate-payment-save.ts`  
**Orchestrator (hook):** `features/payments/payment-drawer/model/use-payment-save-orchestrator.ts`  
**Cache hub:** `entities/payment/cache/synchronize-payment-caches.ts`

---

## Design principles

1. **Lazy create** — an empty draft inserts no row; the first meaningful
   **title** does.
2. **Autosave** — field edits debounce (~600ms) into create or patch; no Save
   button.
3. **One interpreter** — `evaluatePaymentSave` picks the action; the hook only
   schedules it; mutations / offline adapter only apply it.
4. **Imperative delete** — trash is an explicit control; never inferred from
   empty fields.
5. **Cache-first** — optimistic update, server confirms, stale responses gated
   by `updatedAt`.

---

## Actions

`evaluatePaymentSave` is deliberately simple — no date-conflict gate, no
auto-delete:

| Action | When |
| ------ | ---- |
| `create` | no persisted id yet, form valid, meaningful title |
| `patch` | existing id, dirty, valid |
| `noop` | invalid, not dirty, or empty draft |

"Meaningful" is a non-empty trimmed title (`hasMeaningfulContent`). Clearing
fields after create does **not** delete the row — the user uses trash.

After the first successful create, the drawer switches request mode to **edit**
(`openEdit(serverId)` or optimistic draft id offline) so later autosaves PATCH.

---

## Path online

```text
form onChange
  → evaluatePaymentSave (create | patch | noop)
  → noop? clear pending when clean   otherwise debounce (~600ms)
  → TanStack mutation (create | patch)
       onMutate  → synchronizePaymentCaches (optimistic)
       onSuccess → reconcile (create flips to edit; patch newer-wins)
       onError   → restore snapshot
```

Delete **skips the debounce** — it cancels any pending autosave and fires
immediately.

API surfaces (thin routes → `server.ts` use-cases):

- `POST /api/payments` — create
- `PATCH /api/payments/:id` — field edits
- `DELETE /api/payments/:id` — hard delete

Typical status codes: 400 invalid body, 401 unauthenticated, 404 not found,
500 otherwise.

---

## Path offline

When `!isOnline()`:

| Action | Behavior |
| ------ | -------- |
| create | `savePaymentOfflinePending` with draft key + optimistic id; `onPaymentCreated(OPTIMISTIC_PAYMENT_DRAFT_ID)` |
| patch on optimistic id | Overwrite create draft slot (still one POST on flush) |
| patch on server id | Queue `payment:{id}` patch |
| delete optimistic draft | Drop draft key + hub delete (no server DELETE) |
| delete server id | Queue delete + optimistic hub remove |

See [offline.md](./offline.md).

---

## Cache hub membership

Every accepted write (local, offline flush, realtime) becomes a `PaymentChange`:

| Type | Effect |
| ---- | ------ |
| `create` | Upsert into warm month of `payment.date` |
| `update` | Remove `previous.id` from all warm months, upsert `next` into month of `next.date` (handles date month moves and optimistic→server id swap) |
| `delete` | Remove id from all warm months |

`totalAmount` is recomputed inside month cache mutators (`sum-amounts`).

---

## Related

| Doc | Why |
| --- | --- |
| [offline.md](./offline.md) | Queue keys and flush |
| [realtime.md](./realtime.md) | Remote writes into the same hub |
| [responsibilities.md](./responsibilities.md) | File map for mutations / hooks / cache |
