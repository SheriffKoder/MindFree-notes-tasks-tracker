# Realtime

How Payments keep TanStack month caches fresh across tabs and devices without a
full page refresh.

- **Decision:** [ADR 0008](../../../docs/adr/0008-realtime-postgres-changes.md)
- **Hub:** `entities/payment/cache/synchronize-payment-caches.ts`
- **Subscription:** `entities/payment/hooks/use-payments-realtime-sync.ts`
- **Application:** `entities/payment/cache/apply-realtime-payment-change.ts`
- **Pending tracker:** `entities/payment/hooks/payment-mutation-pending.ts`
- **Migration:** `supabase/migrations/011_realtime_payments.sql`

---

## What "live sync" means here

1. Browser opens a Supabase channel on `mf_payments` for the signed-in user.
2. Postgres change events arrive as INSERT / UPDATE / DELETE.
3. The cache adapter maps rows → domain payments, applies safety gates, then
   calls `synchronizePaymentCaches`.
4. Warm month caches (and any open drawer subscribed to a month query) see the
   update.

It is **not** polling and **not** a second copy of payment state beside TanStack.

There is no Home payments list cache — Home only needs the subscription so
offline/online creates from quick-add stay coherent with `/payments`.

### DELETE delivery caveat

Supabase `postgres_changes` filters on non-PK columns (e.g. `user_id`) do **not**
reliably match DELETE events (thin `old` / Realtime DELETE filtering limits).

So the subscription uses:

| Event | Filter |
| ----- | ------ |
| INSERT / UPDATE | `user_id=eq.<auth user>` |
| DELETE | none |

`applyRealtimePaymentChange` only removes a payment when that id is already
present in a warm TanStack month cache — other users' DELETE noise is a no-op.

---

## Responsibility split

`hooks/use-payments-realtime-sync.ts` owns React and Supabase subscription
lifecycle: resolve the signed-in user, subscribe with a user filter on
INSERT/UPDATE and an unfiltered DELETE listener, forward events, invoke the
optional callback after an accepted cache patch, and remove the channel on
cleanup.

`cache/apply-realtime-payment-change.ts` is framework-independent application
logic: map Supabase rows through `transform/map-payment-row.ts`, reject mutation
echoes and stale updates, recover prior membership when possible, and send one
normalized `PaymentChange` through the hub.

This split keeps reconnect/mount concerns out of cache policy and lets every
accepted remote event use the same month membership rules as local mutations and
offline flush.

---

## Safety gates

| Gate | Purpose |
| ---- | ------- |
| Mutation pending | Skip in-flight local write echoes by payment id |
| `updatedAt` newer-wins | `isRemotePaymentNewer` — ignore older UPDATE vs cache |
| DELETE warm membership | Unfiltered DELETE only clears ids already in warm caches |
| Cold months | Hub upserts only into warm month keys; cold months fetch on next visit |

---

## Mount points

| Surface | Where |
| ------- | ----- |
| Payments page | `views/payments/ui/payments-client.tsx` |
| Home | `views/home/ui/home-payment-realtime.tsx` (once from `views/home/index.tsx`) |

Mount once per surface — not inside list cards or the drawer.

---

## Related

| Doc | Why |
| --- | --- |
| [offline.md](./offline.md) | Offline queue path into the same hub |
| [writes-and-autosave.md](./writes-and-autosave.md) | Local mutate path |
| [responsibilities.md](./responsibilities.md) | File map for `cache/` + `hooks/` |
