# Payment domain model

Why Payments is one row shape with a free-form `group` and a decimal `amount` —
and how the UI vocabulary stays separate from the database.

**Types:** `entities/payment/model/types.ts`  
**Table:** `supabase/migrations/010_payments.sql` (`mf_payments`)  
**UI groups:** `shared/config/payment-groups.ts`

---

## Why one table

Product needs a month list, week buckets, a create/edit drawer, Home quick-add,
offline, and realtime. That is one resource — not calendar kinds, not dual
definition/record tables.

- One `mf_payments` row shape.
- Month membership = `date` (`YYYY-MM-DD` → `YYYY-MM`).
- Within-week order = `updated_at` desc.
- Week UI buckets by `date` (shared week-grouping), not by `updated_at`.

Consumers (Payments page, Home quick-add) are **UI surfaces**, not separate
domains. Writes still go through one hub (`synchronizePaymentCaches`).

---

## Domain fields (client)

| Field | Role |
| ----- | ---- |
| `id` | Stable row id |
| `title` | Display name; gate for lazy create (non-empty trim) |
| `amount` | Major currency units, 2 decimal places (`number` in domain) |
| `description` | Optional longer text |
| `date` | Payment day (`YYYY-MM-DD`) — month filter + week grouping |
| `group` | Free-form string stored as-is |
| `createdAt` | Row creation (ISO) |
| `updatedAt` | Last update (ISO) — list order + newer-wins gates |

DB columns are snake_case (`created_at`, `updated_at`, …); `mapPaymentRow` maps
to camelCase. `"group"` is quoted in SQL because `group` is reserved.

---

## Amount storage

```text
Postgres: numeric(12, 2)  →  major units (e.g. 12.50), not integer cents
PostgREST may return amount as string | number
mapPaymentRow → Number(...) for domain Payment.amount
```

Settled rule: do **not** store cents as integers. Validation and the editor form
treat amount as a non-negative decimal with two places of precision in practice.

---

## Group: DB vs UI

| Layer | Rule |
| ----- | ---- |
| Database | Unconstrained `text` — any string is valid |
| Domain `Payment.group` | `string` — no enum |
| Editor dropdown | Options from `PAYMENT_GROUP_OPTIONS` in `shared/config/payment-groups.ts` |

The config object is the **product vocabulary** (Groceries, Home, Personal,
Investments, Giving, Extras). The DB intentionally stays open so new labels can
ship without a migration. Persisted values are the option `id` strings when
chosen from the UI; legacy or imported free-text can still round-trip.

---

## Lifecycle (mental model)

```text
Empty draft drawer
  → user types meaningful title (+ other fields)
  → lazy CREATE (online mutation or offline draft)

Persisted payment
  → PATCH autosave (fields; date may move across months)
  → or DELETE (explicit trash only)

Home quick-add
  → same create path → hub upserts into month of payment.date
```

No auto-delete on cleared fields. No Home-specific payment list model.

---

## Related

| Doc | Why |
| --- | --- |
| [read-models.md](./read-models.md) | Month response + cache key |
| [writes-and-autosave.md](./writes-and-autosave.md) | Create / patch / delete rules |
| [responsibilities.md](./responsibilities.md) | File map |
