# Shared calendar

Domain-agnostic month grid plus an optional **desktop cursor-following hover tip**.

Copy this folder (and its `@/shared/calendar` import alias) into another app and you get:

1. `MonthCalendar` — 6×7 grid, caller-owned cell body via `renderCell`
2. Calendar hover tip — store + portal shell; **no domain types inside this folder**

Wall-clock “today” is **not** here — use `@/shared/lib/today` (or your own equivalent) and pass `todayIso` if you need a fixed/demo day.

---

## Folder map

| Path | Responsibility |
| ---- | -------------- |
| `ui/month-calendar.tsx` | Month grid; optional hover callbacks |
| `ui/calendar-cursor-tooltip.tsx` | Portal tip shell (position, wheel scroll, freeze/resolve) |
| `lib/calendar-hover-store.ts` | Module store: `idle` / `following` / `frozen` |
| `lib/tooltip-position.ts` | Clamp / flip tip near viewport edges |
| `lib/is-fine-pointer-hover.ts` | Gate: `(hover: hover) and (pointer: fine)` |
| `lib/resolve-calendar-date-under-point.ts` | `elementFromPoint` → `[data-calendar-date]` |
| `lib/month-grid.ts` | Pure grid build + aria labels |
| `model/use-calendar-hover.ts` | `useSyncExternalStore` on the hover store |
| `model/use-month-calendar-day-hover.ts` | Fine-pointer + rAF throttling for cell hover |
| `model/types.ts` | `InMonthDay`, `MonthCalendarProps`, hover point |
| `index.ts` | Public barrel |

---

## Hover tip — what it does

On desktop only, hovering a day with content opens a tip that:

- **Follows the cursor** while the pointer is over a cell (`following`)
- **Freezes** position when the pointer enters the tip (`frozen`) so the user can read/scroll without the tip chasing them
- **Resolves** on tip leave: `elementFromPoint` → if over another day with content, retarget; else idle
- **Scrolls via wheel** even when the cursor is still on the cell (tip often sits offset from the pointer)
- **Clears** on day click, month change, and unmount

The store holds only `{ mode, date, x, y }`. Day **data** stays in the parent pane’s already-loaded `calendarDays` array. The tip joins `store.date` → that array via `getDate` / `hasContent` / `renderContent`.

```text
cell hover → setCalendarHoverFollowing(date, x, y)
cell move  → moveCalendarHoverPointer(x, y)     // ignored while frozen
cell leave → scheduleClearCalendarHover()       // short grace
tip enter  → freezeCalendarHover()
tip leave  → resolveCalendarHover(date|null, x, y)
click/month → clearCalendarHover()
```

---

## How to wire (checklist for a new host app)

### 1. Day shape

Each in-month day must satisfy `InMonthDay`:

```ts
{ day: number; date: string /* YYYY-MM-DD */ }
```

Add whatever domain fields you need (`note`, `activities`, …). Shared calendar never imports them.

### 2. Cell content (feature-owned)

Render the grid body yourself:

```tsx
renderCell={(day, { isToday }) => <YourDayCell day={day} isToday={isToday} />}
```

### 3. Hover content (feature-owned, outside this folder)

Create a component that renders the **full** day peek (not truncated like the cell). Also export a predicate:

```ts
function yourDayHasHoverContent(day: YourDay): boolean {
  // return false for empty days — tip stays closed
}
```

**Reference implementations in this repo (not part of the portable package):**

| File | Role |
| ---- | ---- |
| `features/notes/note-calendar-cell/ui/note-calendar-hover-content.tsx` | Notes tip body + `noteCalendarDayHasHoverContent` |
| `features/activity/activity-calendar-cell/ui/activity-calendar-hover-content.tsx` | Tasks/Reminders tip body + `activityCalendarDayHasHoverContent` |

Copy the *pattern*, not the domain markup.

### 4. Pane mount (feature / view)

Mount `MonthCalendar` and `CalendarCursorTooltip` as siblings. Wire store writers from hover callbacks. Clear on select and on month cleanup.

**Reference mounts in this repo:**

| File | Role |
| ---- | ---- |
| `views/notes/ui/notes-views-section.tsx` | Notes calendar view: hover callbacks + tip + clear on view/month |
| `features/activity/activity-page/ui/activity-calendar-pane.tsx` | Tasks/Reminders calendar: same pattern, narrower `width` |

Minimal wiring shape:

```tsx
import {
  CalendarCursorTooltip,
  MonthCalendar,
  clearCalendarHover,
  moveCalendarHoverPointer,
  scheduleClearCalendarHover,
  setCalendarHoverFollowing,
  type CalendarDayHoverPoint,
} from "@/shared/calendar";

// On month change / unmount:
useEffect(() => () => clearCalendarHover(), [month]);

const handleDaySelect = (date: string) => {
  clearCalendarHover();
  onDaySelect(date);
};

const handleDayHoverStart = (date: string, point: CalendarDayHoverPoint) => {
  const day = calendarDays.find((d) => d.date === date);
  if (day && yourDayHasHoverContent(day)) {
    setCalendarHoverFollowing(date, point.x, point.y);
    return;
  }
  clearCalendarHover();
};

const handleDayHoverMove = (_date: string, point: CalendarDayHoverPoint) => {
  moveCalendarHoverPointer(point.x, point.y);
};

const handleDayHoverEnd = () => {
  scheduleClearCalendarHover();
};

return (
  <>
    <MonthCalendar
      month={month}
      calendarDays={calendarDays}
      onDaySelect={handleDaySelect}
      onDayHoverStart={handleDayHoverStart}
      onDayHoverMove={handleDayHoverMove}
      onDayHoverEnd={handleDayHoverEnd}
      renderCell={renderCell}
    />
    <CalendarCursorTooltip
      days={calendarDays}
      getDate={(d) => d.date}
      hasContent={yourDayHasHoverContent}
      renderContent={(day) => <YourHoverContent day={day} />}
      width="14rem" // optional; default is wider (notes-like)
    />
  </>
);
```

`MonthCalendar` already:

- attaches `data-calendar-date` on cells (needed for tip-leave resolve)
- gates pointer handlers with `isFinePointerHover` + rAF move throttle via `useMonthCalendarDayHover`

You do **not** need to call those helpers from the pane unless you build a custom grid.

### 5. CSS variables expected by the tip shell

The default panel uses theme tokens:

- `--color-border`
- `--color-surface`

Feature hover content may use `--color-fg`, `--color-fg-muted`, `--color-accent`, etc. Provide equivalents in the host app or restyle via `className` / your own content.

### 6. What not to put in the store

Do **not** put `Note`, `Activity`, or day payloads into `calendar-hover-store`. Only ISO `date` + pointer + mode. Always join from the pane’s `calendarDays`.

---

## Public API (`index.ts`)

| Export | Use |
| ------ | --- |
| `MonthCalendar` | Grid |
| `CalendarCursorTooltip` | Tip portal |
| `useCalendarHover` | Read store in custom UI |
| `setCalendarHoverFollowing` / `moveCalendarHoverPointer` / `freezeCalendarHover` / `resolveCalendarHover` / `clearCalendarHover` / `scheduleClearCalendarHover` / `cancelScheduledClearCalendarHover` | Store writers |
| `computeTooltipPosition` | Pure position helper |
| `isFinePointerHover` | Desktop gate |
| `resolveCalendarDateUnderPoint` | Tip-leave retarget |
| `buildMonthGrid`, `WEEKDAY_LABELS`, format helpers | Grid utilities |
| Types: `InMonthDay`, `MonthCalendarProps`, `CalendarDayHoverPoint`, `CalendarHoverState`, … | |

---

## Out of scope (by design)

- Opening drawers/modals from the tip (click stays on the cell)
- Keyboard / focus-driven tip
- Fetching inside the tip
- Touch / coarse pointer (handlers no-op)

---

## Dependencies

- React (client components + `createPortal`)
- Host `cn` utility at `@/lib/utils` (class merge) — swap import if your app differs
- `@/shared/lib/today` only if you rely on `MonthCalendar`’s default live today; otherwise pass `todayIso`
