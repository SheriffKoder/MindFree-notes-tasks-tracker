# Week grouping (`shared/week-grouping`)

Reusable layout for grouping dated list items into ISO calendar weeks (Monday–Sunday) within a month. Collapsible week headers, ungrouped fallback, and pure grouping utilities live here — not in `list-view`.

## Reuse

Import from `shared/week-grouping/index.ts` only. The module is generic: any list of items with an ISO date field can use it.

```tsx
import { WeekOrganizer, type WeekGroupingConfig } from "@/shared/week-grouping";

const weekGrouping: WeekGroupingConfig = {
  month: "2026-07",
  dateKey: "date",
  defaultOpen: true,
};

<WeekOrganizer
  items={rows}
  weekGrouping={weekGrouping}
  getKey={(row) => row.id}
  renderItem={(row) => <MyCard row={row} />}
/>
```

| Export | Role |
| ------ | ---- |
| `WeekOrganizer` | Groups items and renders week sections + ungrouped block |
| `getWeeksInMonth` | Pure clipped ISO week ranges for a month (includes empty weeks) |
| `groupItemsByWeekInMonth` | Pure bucketing (tests, custom UI); consumes `getWeeksInMonth` |
| `formatWeekRangeLabel` | Week header date range label |
| `WeekGroupingConfig` | Config shape for enabling week layout |

## Placement in the list-view tree

Week grouping is **not** part of `ListView`'s core API. It is plugged in by the mobile grid host when `weekGrouping` is set:

```text
ListView
├── CardGridDesktop          → always flat 3-column grid
└── CardGridMobile           → layout host
      ├── weekGrouping set   → WeekOrganizer   (this module)
      └── weekGrouping unset → flat item map   (single column)
```

Dependency direction:

```text
list-view          →  does not import week-grouping internals
card-grid-mobile   →  imports WeekOrganizer when weekGrouping is present
week-grouping      →  does not import list-view
```

On the Notes page, `notes-views-section` passes `weekGrouping` to `ListView` for month notes only; general notes omit it and get a flat list.

## Folder layout

```text
shared/week-grouping/
├── index.ts
├── README.md
├── lib/
│   ├── get-weeks-in-month.ts
│   ├── group-by-week-in-month.ts
│   └── format-week-date-label.ts
├── model/
│   └── types.ts                 # WeekGroupingConfig
└── ui/
    ├── week-organizer.tsx       # public entry
    ├── week-group-section.tsx
    └── ungrouped-items-section.tsx
```
