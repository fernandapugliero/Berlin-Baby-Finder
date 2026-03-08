import { format } from "date-fns";
import type { Activity } from "./types";

function toGCalDate(d: Date): string {
  return format(d, "yyyyMMdd'T'HHmmss");
}

export function getGoogleCalendarUrl(activity: Activity): string {
  const start = new Date(activity.start_time);
  const end = activity.end_time ? new Date(activity.end_time) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: activity.title,
    dates: `${toGCalDate(start)}/${toGCalDate(end)}`,
    location: activity.address || activity.location_name,
    details: activity.description || "",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcs(activity: Activity): void {
  const start = new Date(activity.start_time);
  const end = activity.end_time ? new Date(activity.end_time) : new Date(start.getTime() + 2 * 60 * 60 * 1000);

  const fmt = (d: Date) => format(d, "yyyyMMdd'T'HHmmss");

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${activity.title}`,
    `LOCATION:${activity.address || activity.location_name}`,
    `DESCRIPTION:${(activity.description || "").replace(/\n/g, "\\n")}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${activity.title.replace(/\s+/g, "-")}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
