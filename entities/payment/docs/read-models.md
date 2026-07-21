# Payment read models

Why Payments exposes **one** month API payload (and one TanStack month key)
instead of a Home list or a flat “all payments” cache.

- **Domain and DB-row types:** `entities/payment/model/types.ts`
- **Response types:** `entities/payment/model/read-models.ts`
- **Keys:** `entities/payment/client/query-keys.ts`

---

## Why one read model

| Surface | Question | Scope |
| ------- | -------- | ----- |
| Payments page | What’s in this month, and what’s the total? | One `YYYY-MM` |
| Home quick-add | Can I create without visiting `/payments`? | No dedicated list |

Home does **not** need a payments strip or starred set. Creating from Home only
needs the write path + hub so the correct month bucket is warm when the user
opens `/payments`. Extra Home caches would duplicate membership rules for no UI.

Writes still go through one domain (mutations + `synchronizePaymentCaches`) so
every warm month key stays aligned.

---

## Where each client responsibility lives

| Responsibility | Location | Why |
| -------------- | -------- | --- |
| Query keys | `client/query-keys.ts` | One canonical month identity |
| Browser fetchers + query options | `client/payments-month-query.ts` | HTTP beside TanStack options |
| React read hook | `hooks/use-payments-month-query.ts` | React lifecycle separate from request defs |
| SSR cache seeder | `hydration/seed-payments-page-cache.ts` | Seed entity-owned keys; caller dehydrates |
| Cross-source cache policy | `cache/` | Mutations, realtime, offline share membership |

Consumers import through `client.ts` or `server.ts` — not deep implementation
paths.

---

## Month list

```text
GET /api/payments?month=YYYY-MM
→ PaymentsMonthResponse
TanStack key: ["payments", month]
Prefix (all warm months): ["payments"]
```

| Field | Purpose |
| ----- | ------- |
| `month` | Canonical `YYYY-MM` (parsed / defaulted via `parseMonthParam`) |
| `payments` | Rows in that month, ordered by `updatedAt` descending |
| `totalAmount` | Sum of `amount` for those rows (`sumAmounts`) |

Server owns month range bounds and the sorted list. The page groups by **week**
from each payment’s `date` (shared week-grouping) without re-sorting the global
list for week headers.

**Who uses it:** `/payments` month navigator + list, drawer resolution (subscribe
to a month so hub writes re-render), Home quick-add after create (hub upserts the
payment’s date month when that key is warm).

**Mutation ownership:** A payment lives in the month of its `date`. Changing
`date` across months relocates via hub `update` (remove from all warm months,
upsert into `next.date` month). Cold months are left alone until next fetch.

---

## What we deliberately omit

| Omitted cache | Why |
| ------------- | --- |
| Home payments list | No Home list UI; quick-add is write-only |
| All-time / unscoped payments | Product is month-scoped |
| Separate “totals only” key | `totalAmount` rides with the month response |

---

## Related

| Doc | Why |
| --- | --- |
| [domain-model.md](./domain-model.md) | Fields, amount, group |
| [writes-and-autosave.md](./writes-and-autosave.md) | How writes hit the hub |
| [realtime.md](./realtime.md) | Remote patches into warm months |
| [responsibilities.md](./responsibilities.md) | File map |
