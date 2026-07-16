/**
 * @file entities/activity/editor/lib/form-labels.ts
 * Display labels for activity form enums.
 */

import type { ScheduleType, TrackingMode } from "@/entities/activity/model/types";
import type { Weekday } from "@/entities/activity/model/types";

export const TRACKING_MODE_LABELS: Record<TrackingMode, string> = {
  boolean: "Done / not done",
  count: "Count",
  duration: "Duration",
  "count+duration": "Count + duration",
};

export const SCHEDULE_TYPE_LABELS: Record<ScheduleType, string> = {
  once: "Once",
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export const MONTH_LABELS: { value: string; label: string }[] = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];
