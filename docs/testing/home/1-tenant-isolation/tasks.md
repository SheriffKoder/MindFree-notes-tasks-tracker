# Tenant isolation — Tasks

Part of [Home — Tenant isolation](./README.md).

## How it happens + where it can break

### View — today's task list

[1] HomeTodayList to render today's tasks [@views/home/ui/home-today-list.tsx](../../../../views/home/ui/home-today-list.tsx)  
! failure: UI renders another user's tasks from a bad payload/cache  
↓  
[2] useHomeTodayQuery("task") to join activities + month records for today [@entities/activity/hooks/use-home-today-query.ts](../../../../entities/activity/hooks/use-home-today-query.ts)  
↓  
[3] GET /api/activities?kind=task that resolves session userId [@app/api/activities/route.ts](../../../../app/api/activities/route.ts)  
! failure: no session still returns defs, or wrong userId is used  
↓  
[4] getActivitiesResponse to return only this user's task definitions [@entities/activity/queries/get-activities-response.ts](../../../../entities/activity/queries/get-activities-response.ts)  
! failure: activities returned without userId scope  
↓  
[5] GET /api/activity-records?month=… that resolves session userId [@app/api/activity-records/route.ts](../../../../app/api/activity-records/route.ts)  
! failure: no session still returns records, or wrong userId is used  
↓  
[6] getActivityRecordsResponse to return only this user's month records [@entities/activity/queries/get-activity-records-response.ts](../../../../entities/activity/queries/get-activity-records-response.ts)  
! failure: records returned without userId scope  
↓  
[7] client join that derives today's rows from those two caches only  
! failure: join surfaces rows that belong to another user

---

### Edit — toggle / quick-record

No task definition create on Home — record upsert/delete only.

[1] useQuickRecord to toggle done / clear an empty record [@features/activity/quick-record/model/use-quick-record.ts](../../../../features/activity/quick-record/model/use-quick-record.ts)  
! failure: toggle targets a task/record owned by another user  
↓  
[2] POST|DELETE /api/activity-records that resolves session userId [@app/api/activity-records/route.ts](../../../../app/api/activity-records/route.ts)  
! failure: no session still writes, or body supplies userId  
↓  
[3] upsertActivityRecord to write a record owned by that userId [@entities/activity/mutations/record/upsert-activity-record.ts](../../../../entities/activity/mutations/record/upsert-activity-record.ts)  
! failure: upsert runs without session userId  
↓  
[4] repository INSERT/DELETE that sets / scopes user_id from the session (must not trust body.userId)  
! failure: write omits user_id or uses a client-supplied owner

**Soft spot:** client-supplied `taskId` on upsert; ownership is RLS + FK + insert `user_id`.
