# Offline

How Payments stay usable without a network, then converge when online again.

**Decision:** [ADR 0009](../../../docs/adr/0009-offline-writes-simple-queue.md)  
**Shared HOW:** [shared/offline-queue/README.md](../../../shared/offline-queue/README.md)  
**Adapter:** `entities/payment/offline/payments-offline-storage.ts`  
**Flush → hub:** `entities/payment/offline/payment-change-from-offline.ts`

---

## Mental model

```text
Offline save
  → localStorage pending write (this user only)
  → optimistic TanStack patch (warm month caches via hub)
  → UI "saved"

Online again / focus
  → flush pending → API
  → PaymentChange → synchronizePaymentCaches
  → remove pending key

Other tab (still offline)
  → storage event → merge → cache update
```

No CRDT. No merge UI. **Last write wins** per resource key (`savedAt` >
cached `updatedAt`).

---

## Payment-specific pieces

| Concern | Where |
| ------- | ----- |
| Create / patch / delete payloads | `payments-offline-storage.ts` |
| Optimistic apply while offline | Same adapter → `synchronizePaymentCaches` |
| Flush after reconnect | `useOfflineSync` + payment adapter |
| Orchestrator branch | `use-payment-save-orchestrator` checks `isOnline()` before mutate |

### Keys

| Operation | Key | Notes |
| --------- | --- | ----- |
| create (draft) | `payment:draft` (`PAYMENT_OFFLINE_DRAFT_KEY`) | Last-win single slot |
| patch / delete | `payment:{id}` | One slot per server id |

Stable client id while a draft is unsynced: `optimistic-payment-draft`
(`OPTIMISTIC_PAYMENT_DRAFT_ID`). Later offline edits of that draft overwrite the
**create** slot (still one POST on flush), not a separate patch key.

Entity string for the shared queue: `"payment"` (`PAYMENT_OFFLINE_ENTITY`).

---

## Flush behavior

1. Execute API create / patch / delete from the stored payload.
2. Map success through `paymentChangeFromOfflineFlush` → `PaymentChange`.
3. Call `synchronizePaymentCaches` (same hub as online + realtime).
4. Remove the offline write key.

Create flush with a prior optimistic row uses `update` (`previous` draft id →
`next` server id) so the hub removes the optimistic id and upserts the server
row into the correct month.

### Deleting an unsynced draft

If the user deletes while the id is still optimistic:

1. `removeOfflineWrite(userId, PAYMENT_OFFLINE_DRAFT_KEY)` — drop the pending POST.
2. Hub `delete` for the optimistic row.
3. No server `DELETE` (nothing was ever inserted).

---

## Mount points

| Surface | Where |
| ------- | ----- |
| Payments page | `views/payments/ui/payments-client.tsx` — `useOfflineSync` + `OfflineBanner` |
| Home | `views/home/ui/home-payment-offline.tsx` (once from `views/home/index.tsx`) |

Home must mount because quick-add can queue creates while `/payments` is not open.

---

## Limits (v1)

- Two devices editing the same payment offline can overwrite by timestamp
- localStorage only — no attachments
- Banner indicates offline; it does not block editing

---

## Related

| Doc | Why |
| --- | --- |
| [realtime.md](./realtime.md) | Online multi-tab/device path |
| [writes-and-autosave.md](./writes-and-autosave.md) | Same actions, different transport |
| [responsibilities.md](./responsibilities.md) | File map for `offline/` |
