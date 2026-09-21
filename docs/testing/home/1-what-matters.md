# Home — What matters

Critical areas on the home page that should be proved to work.
Ordered by product risk (highest first). Personal planning notes under
`app/development/testing/` stay gitignored; this file is the repo map.

## Findings / areas

| Priority | Area | What success looks like | Failure we protect against |
| -------- | ---- | ----------------------- | -------------------------- |
| 1 | Tenant isolation | Logged-in user sees only their notes, tasks, reminders; payment writes are theirs | User A receives or mutates User B's data |
| 2 | Starred notes (read) | Starred notes display, grouped by home categories | Empty/wrong strips; notes missing or in the wrong category |
| 3 | Today's tasks (read) | Today's tasks list shows the user's tasks for the viewing day | Tasks missing, wrong day, or another user's tasks |
| 4 | Today's reminders (read) | Today's reminders list shows the user's reminders for the viewing day | Reminders missing, wrong day, or another user's reminders |
| 5 | Note edit (write) | Edit/update a note; change persists and UI reflects it | DB not updated, or UI stale after save |
| 6 | Task complete/update (write) | Complete/update today's task; persists and UI reflects it | Completion/status not saved or not shown |
| 7 | Reminder complete/update (write) | Complete/update today's reminder; persists and UI reflects it | Completion/status not saved or not shown |
| 8 | Quick note create | Add a quick note; selectors stay local until content is written, then persist | Premature create; create fails; draft rules broken |
| 9 | Reminder quick add | Add a reminder from home quick add; persists and list updates | Create fails or list does not refresh |
| 10 | Payment create | Add a payment from home; reflects in DB | Create fails or write is not attributed to the user |
| 11 | Offline / realtime adapters | Payment & activity offline + realtime adapters on home keep sync coherent | Stale UI, dropped offline writes, or broken realtime updates |

## Practice map — skills from `testing-2.js`

Product risk (above) vs skills to practice. Topics: Testing functions;
Testing components (isolated + props); User flow; Async sections (mock only);
API mocking / Integration. E2E from the same notes is optional where noted.

| Priority | Area | Main testing skills |
| -------- | ---- | ------------------- |
| 1 | Tenant isolation | Integration (+ selective mocks at auth/client boundary). Optional E2E. Skip component/unit for isolation — UI does not own `userId`. |
| 2 | Starred notes (read) | Async sections (mock only); Testing functions (grouping/mapping); Testing components (dumb strips/empty with props) |
| 3 | Today's tasks (read) | Async sections (mock only); Testing functions (day filter); Testing components (list/empty with props) |
| 4 | Today's reminders (read) | Async sections (mock only); Testing functions (day filter); Testing components (list/empty with props) |
| 5 | Note edit (write) | User flow; API mocking / Integration (mutation persist + UI refresh) |
| 6 | Task complete/update (write) | User flow; API mocking / Integration |
| 7 | Reminder complete/update (write) | User flow; API mocking / Integration |
| 8 | Quick note create | User flow (draft rules, validation); API mocking / Integration |
| 9 | Reminder quick add | User flow; API mocking / Integration |
| 10 | Payment create | User flow; API mocking / Integration (incl. user attribution) |
| 11 | Offline / realtime adapters | Store/adapter mocks, fake timers; advanced vs classic API mock |

## Scope note

Aside widgets (clock, calendar, world time) are intentionally out of this
critical map for now.
