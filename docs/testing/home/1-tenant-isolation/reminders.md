# Tenant isolation — Reminders

Part of [Home — Tenant isolation](./README.md).

## How it happens + where it can break

### View — today's reminder list

[1] HomeRemindersList to render today's reminders [@views/home/ui/home-reminders-list.tsx](../../../../views/home/ui/home-reminders-list.tsx)  
! failure: UI renders another user's reminders from a bad payload/cache  
↓  
[2] useHomeTodayQuery("reminder") to join reminder defs + month records for today [@entities/activity/hooks/use-home-today-query.ts](../../../../entities/activity/hooks/use-home-today-query.ts)  
↓  
[3] GET /api/activities?kind=reminder that resolves session userId [@app/api/activities/route.ts](../../../../app/api/activities/route.ts)  
! failure: no session still returns defs, or wrong userId is used  
↓  
[4] GET /api/activity-records?month=… that resolves session userId [@app/api/activity-records/route.ts](../../../../app/api/activity-records/route.ts)  
! failure: no session still returns records, or wrong userId is used  
↓  
[5] activity responses that include only this user's rows  
! failure: response mixes another tenant's rows  
↓  
[6] client join that derives today's reminder rows from those caches only  
! failure: join surfaces rows that belong to another user

---

### Edit — toggle / quick-record

[1] useQuickRecord to toggle done / clear an empty reminder record [@features/activity/quick-record/model/use-quick-record.ts](../../../../features/activity/quick-record/model/use-quick-record.ts)  
! failure: toggle targets a reminder/record owned by another user  
↓  
[2] POST|DELETE /api/activity-records that resolves session userId [@app/api/activity-records/route.ts](../../../../app/api/activity-records/route.ts)  
! failure: no session still writes, or body supplies userId  
↓  
[3] upsertActivityRecord to write a record owned by that userId [@entities/activity/mutations/record/upsert-activity-record.ts](../../../../entities/activity/mutations/record/upsert-activity-record.ts)  
! failure: upsert runs without session userId  
↓  
[4] repository INSERT/DELETE that sets / scopes user_id from the session  
! failure: write omits user_id or uses a client-supplied owner

---

### Edit — quick add (create definition)

[1] HomeReminderQuickAdd to open create for a new reminder [@views/home/ui/home-reminder-quick-add.tsx](../../../../views/home/ui/home-reminder-quick-add.tsx)  
! failure: create flow continues without an authenticated session  
↓  
[2] POST /api/activities that resolves session userId [@app/api/activities/route.ts](../../../../app/api/activities/route.ts)  
! failure: no session still creates, or body supplies userId  
↓  
[3] createActivity to insert a reminder owned by that userId [@entities/activity/mutations/create-activity.ts](../../../../entities/activity/mutations/create-activity.ts)  
! failure: create runs without session userId  
↓  
[4] repository INSERT that sets user_id from the session [@entities/activity/repository/create-activity.ts](../../../../entities/activity/repository/create-activity.ts)  
! failure: INSERT uses client userId or omits user_id

**Soft spot:** same `taskId` upsert concern as tasks. Forged `kind` creates under the *same* user (not cross-tenant).
