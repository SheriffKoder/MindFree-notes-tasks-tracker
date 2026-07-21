# Payment entity — where to look

File map by responsibility. Paths are relative to `entities/payment/` unless
noted. For the *why* behind these, see the WHY docs in this folder
([README.md](./README.md)).

---

## Entry points

`index.ts` — domain types + pure month helpers (any layer)  
`server.ts` — server reads, SSR hydrate, write use-cases, `getAuthenticatedUserId` (API routes, RSC)  
`client.ts` — TanStack keys, fetchers, read hooks, mutation hooks, realtime hook, cache hub (client only)  
`editor/index.ts` — form schema types, `usePaymentForm`, `PaymentForm`  
`offline/index.ts` — offline adapter + flush → `PaymentChange` helpers

Prefer these surfaces outside the entity. Internal barrels such as
`repository/index.ts`, `cache/index.ts`, and `hooks/index.ts` keep imports stable
between responsibility groups without exposing every implementation globally.

---

## Domain model

`model/types.ts` — domain `Payment` and raw database `PaymentRow`  
`model/read-models.ts` — `PaymentsMonthResponse` (`month`, `payments`, `totalAmount`)

---

## Validation

`schema/create-payment.schema.ts` — POST body + response  
`schema/update-payment.schema.ts` — PATCH body (partial) + response  
`schema/index.ts` — schema barrel

`group` is unconstrained `text` in the DB. UI vocabulary lives in
`shared/config/payment-groups.ts` (not in the entity).

---

## Pure helpers (`lib/`)

`lib/parse-month.ts` — `getCurrentMonth`, `parseMonthParam`, `getMonthRange`  
`lib/month-key-from-date.ts` — `YYYY-MM` from payment `date`  
`lib/sum-amounts.ts` — recompute month `totalAmount`

---

## Domain shaping (`transform/`)

`transform/map-payment-row.ts` — snake_case `PaymentRow` → domain `Payment`  
`transform/index.ts` — transform barrel

---

## Persistence (`repository/`, RLS-scoped)

`repository/get-authenticated-user-id.ts` — resolve current user for RLS  
`repository/get-payments-for-month.ts` — month range read (`updated_at` desc)  
`repository/create-payment.ts` — insert  
`repository/update-payment.ts` — patch by id  
`repository/delete-payment.ts` — delete by id  
`repository/index.ts` — repository barrel

---

## Server reads (`queries/`)

`queries/get-payments-month-response.ts` — month param → repo → `PaymentsMonthResponse`  
`queries/get-payments-page-initial-data.ts` — SSR payload for `/payments`  
`queries/index.ts` — server-read surface consumed by `server.ts`

---

## Server writes (`mutations/`)

`mutations/create-payment.ts` — parse create schema → repo create  
`mutations/update-payment.ts` — parse update schema → repo update  
`mutations/delete-payment.ts` — hard delete (404 when missing)  
`mutations/index.ts` — write surface consumed by `server.ts`

API routes (outside entity): `app/api/payments/route.ts` (GET/POST),
`app/api/payments/[id]/route.ts` (PATCH/DELETE).

---

## Client requests (`client/`)

`client/query-keys.ts` — `paymentsMonthQueryKey(month)`, `paymentsQueryKeyPrefix`  
`client/payments-month-query.ts` — `fetchPaymentsMonth`, `paymentsMonthQueryOptions`  
`client/post-payment.ts` / `patch-payment.ts` / `delete-payment.ts` — write fetchers  
`client/index.ts` — client request barrel

---

## SSR cache seeding (`hydration/`)

`hydration/seed-payments-page-cache.ts` — seed one month query for `/payments`  
`hydration/index.ts` — hydration barrel

There is **no** Home payments list cache — Home quick-add only writes through the
hub into warm month keys when a create settles.

---

## Cache updates (`cache/`, pure + hub)

`cache/payment-cache-mutations.ts` — upsert/remove in one month response;
`buildOptimisticPayment`, `mergePatchIntoPayment`  
`cache/find-payment-in-cache.ts` — search warm month caches by id  
`cache/is-remote-payment-newer.ts` — newer-wins `updatedAt` gate  
`cache/apply-realtime-payment-change.ts` — `mf_payments` event → gated hub call  
`cache/synchronize-payment-caches.ts` — `PaymentChange` fan-out hub (create /
update with month relocate / delete; optimistic→server id swap on update)  
`cache/index.ts` — cache barrel

WHY: [realtime.md](./realtime.md), [writes-and-autosave.md](./writes-and-autosave.md).

---

## Offline (`offline/`)

`offline/payments-offline-storage.ts` — keys/payloads, pending apply, merge, flush,
`savePaymentOfflinePending`, `createPaymentsOfflineSyncAdapter`  
`offline/payment-change-from-offline.ts` — successful flush → `PaymentChange`  
`offline/index.ts` — offline adapter surface

Offline transport is separate from cache policy; successful replay rejoins the
same hub as online mutations and realtime. WHY: [offline.md](./offline.md).

---

## Read hooks + mutations (`hooks/`)

`hooks/use-payments-month-query.ts` — `usePaymentsMonthQuery(month)`  
`hooks/use-create-payment-mutation.ts` — create + optimistic upsert + rollback  
`hooks/use-update-payment-mutation.ts` — patch autosave + optimistic + newer-wins  
`hooks/use-delete-payment-mutation.ts` — delete + cache removal  
`hooks/payment-mutation-pending.ts` — in-flight ids (realtime echo skip)  
`hooks/use-payments-realtime-sync.ts` — `postgres_changes` → apply adapter  
`hooks/index.ts` — hooks barrel

---

## Editor form (`editor/`)

### Contracts & state

`editor/model/types.ts` — `PaymentFormValues`, change/footer meta, form/hook props  
`editor/model/payment-form.schema.ts` — Zod form values  
`editor/model/use-payment-form.ts` — local fields, dirty/valid meta, reset on
`resetKey` / `commitKey`

### UI

`editor/ui/payment-form.tsx` — composes field rows + last-saved footer meta  
`editor/ui/payment-form-last-saved.tsx` — last-edited / save-status label  
`editor/fields/*` — title, amount, description, date, group rows + shared field row

### Display helpers

`editor/lib/format-last-edited.ts` — footer timestamp formatting  
`editor/lib/form-classes.ts` — shared Tailwind + menu z-index classes  
`editor/index.ts` — editor public surface

---

## Payments page + drawer (`views/` / `features/`)

Outside the entity but useful for navigation:

| Area | Owns |
| ---- | ---- |
| `views/payments/` | Page shell, URL `?month=`, hydration seed, month list, add button |
| `features/payments/payment-drawer/` | Drawer shell, save orchestrator, `evaluatePaymentSave` |
| `features/payments/payment-list-card/` | List row UI |
| `views/home/ui/home-payment-*` | Home quick-add + offline/realtime null islands |

Autosave decision + orchestrator: [writes-and-autosave.md](./writes-and-autosave.md).

---

## Quick lookup

| I need to… | Start here |
| ---------- | ---------- |
| Change payment fields | `model/types.ts` |
| Change month parsing / bounds | `lib/parse-month.ts` |
| Change group dropdown options | `shared/config/payment-groups.ts` |
| Change month list / total shaping | `queries/get-payments-month-response.ts`, `lib/sum-amounts.ts` |
| Change cache hub / month relocate | `cache/synchronize-payment-caches.ts` |
| Change realtime gates | `cache/apply-realtime-payment-change.ts` |
| Change offline keys / flush | `offline/payments-offline-storage.ts` |
| Change create/patch/noop rules | `features/payments/payment-drawer/pre-save-orchestrator/` |
| Add / alter table columns | `supabase/migrations/010_payments.sql` |
| Enable realtime publication | `supabase/migrations/011_realtime_payments.sql` |
