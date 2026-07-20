/**
 * @file entities/profile/lib/build-export-workbook.ts
 * Builds a multi-sheet Excel workbook (notes, tasks, reminders, records).
 */

import type { Activity, ActivityRecord } from "@/entities/activity/model/types";
import type { Note } from "@/entities/note/model/types";
import * as XLSX from "xlsx";

function activityRows(activities: Activity[]) {
  return activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description ?? "",
    color: activity.color ?? "",
    trackingMode: activity.trackingMode,
    scheduleType: activity.scheduleType,
    scheduleConfig:
      activity.scheduleConfig == null
        ? ""
        : JSON.stringify(activity.scheduleConfig),
    goal: activity.goal ?? "",
    goalDuration: activity.goalDuration ?? "",
    startsAt: activity.startsAt ?? "",
    endsAt: activity.endsAt ?? "",
    archivedAt: activity.archivedAt ?? "",
    createdAt: activity.createdAt,
    updatedAt: activity.updatedAt,
  }));
}

/**
 * Creates an `.xlsx` buffer with sheets: Notes, Tasks, Reminders, Records.
 */
export function buildExportWorkbook(input: {
  notes: Note[];
  tasks: Activity[];
  reminders: Activity[];
  records: ActivityRecord[];
}): Buffer {
  const workbook = XLSX.utils.book_new();

  const notesSheet = XLSX.utils.json_to_sheet(
    input.notes.map((note) => ({
      id: note.id,
      date: note.date ?? "",
      title: note.title,
      content: note.content,
      starred: note.starred,
      isImportant: note.isImportant,
      isQuick: note.isQuick,
      lastEditedAt: note.lastEditedAt,
    })),
  );
  XLSX.utils.book_append_sheet(workbook, notesSheet, "Notes");

  const tasksSheet = XLSX.utils.json_to_sheet(activityRows(input.tasks));
  XLSX.utils.book_append_sheet(workbook, tasksSheet, "Tasks");

  const remindersSheet = XLSX.utils.json_to_sheet(
    activityRows(input.reminders),
  );
  XLSX.utils.book_append_sheet(workbook, remindersSheet, "Reminders");

  const recordsSheet = XLSX.utils.json_to_sheet(
    input.records.map((record) => ({
      id: record.id,
      taskId: record.taskId,
      date: record.date,
      trackingModeSnapshot: record.trackingModeSnapshot,
      goalSnapshot: record.goalSnapshot ?? "",
      goalDurationSnapshot: record.goalDurationSnapshot ?? "",
      count: record.count,
      duration: record.duration,
      description: record.description ?? "",
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    })),
  );
  XLSX.utils.book_append_sheet(workbook, recordsSheet, "Records");

  const output = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  }) as Buffer;

  return Buffer.from(output);
}
