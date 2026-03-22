/**
 * Airtable data layer — fetches from the airtable-proxy edge function,
 * computes next occurrences, and maps records to the Activity shape.
 */
import { supabase } from "@/integrations/supabase/client";
import type { Activity, BerlinDistrict } from "./types";

// ─── Airtable raw record shape ────────────────────────────────────────────

export interface AirtableEvent {
  airtable_id: string;
  Title?: string;
  Description?: string;
  Venue?: string[]; // linked record IDs
  "Day of week"?: string;
  "Start time"?: string; // "HH:MM" or "HH:MM:SS" or ISO
  "End time"?: string;
  "Age min"?: number;
  "Age max"?: number;
  "Age label"?: string;
  "Recurrence type"?: "weekly" | "monthly" | "once";
  "Week of month"?: number | string; // 1-5 or "last"
  Date?: string; // ISO date for one-off events
  "Price type"?: "free" | "paid";
  Price?: number;
  Sponsored?: boolean;
  "Registration required"?: boolean;
  "Registration link"?: string;
  Source?: string;
  Status?: string;
  "Verified at"?: string;
  "Is active"?: boolean;

  // Lookup fields from Venue
  "Address (lookup)"?: string | string[];
  "District (lookup)"?: string | string[];
  "Latitude (lookup)"?: number | number[];
  "Longitude (lookup)"?: number | number[];

  // Resolved by edge function
  _venue_resolved?: {
    Name?: string;
    Address?: string;
    District?: string;
    Latitude?: number;
    Longitude?: number;
    [k: string]: unknown;
  } | null;
}

// ─── Constants ─────────────────────────────────────────────────────────────

const VALID_DISTRICTS: string[] = [
  "Mitte", "Friedrichshain-Kreuzberg", "Pankow", "Charlottenburg-Wilmersdorf",
  "Spandau", "Steglitz-Zehlendorf", "Tempelhof-Schöneberg", "Neukölln",
  "Treptow-Köpenick", "Marzahn-Hellersdorf", "Lichtenberg", "Reinickendorf",
];

const DAY_MAP: Record<string, number> = {
  Montag: 1, Dienstag: 2, Mittwoch: 3, Donnerstag: 4,
  Freitag: 5, Samstag: 6, Sonntag: 0,
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4,
  Friday: 5, Saturday: 6, Sunday: 0,
};

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Unwrap Airtable lookup fields that may be arrays. */
function unwrap<T>(val: T | T[] | undefined | null): T | undefined {
  if (Array.isArray(val)) return val[0];
  return val ?? undefined;
}

/** Parse "HH:MM" or "HH:MM:SS" to { h, m }. */
function parseTime(t?: string): { h: number; m: number } | null {
  if (!t) return null;
  const parts = t.split(":").map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return { h: parts[0], m: parts[1] };
}

/** Compute the next occurrence date-time for a recurring or one-off event. */
export function computeNextOccurrence(evt: AirtableEvent): Date | null {
  const recurrence = evt["Recurrence type"];
  const dayOfWeek = evt["Day of week"];
  const startTime = parseTime(evt["Start time"]);

  if (!startTime) return null;

  const now = new Date();

  if (recurrence === "once") {
    const dateStr = evt.Date;
    if (!dateStr) return null;
    const d = new Date(dateStr);
    d.setHours(startTime.h, startTime.m, 0, 0);
    return d;
  }

  if (recurrence === "weekly") {
    if (!dayOfWeek || !(dayOfWeek in DAY_MAP)) return null;
    const targetDay = DAY_MAP[dayOfWeek];
    const currentDay = now.getDay();
    let daysAhead = targetDay - currentDay;

    // If it's today, check if the event hasn't ended yet
    if (daysAhead === 0) {
      const endTime = parseTime(evt["End time"]);
      const checkTime = endTime || startTime;
      const eventEnd = new Date(now);
      eventEnd.setHours(checkTime.h, checkTime.m, 0, 0);
      if (now > eventEnd) daysAhead = 7; // already passed today, next week
    } else if (daysAhead < 0) {
      daysAhead += 7;
    }

    const d = new Date(now);
    d.setDate(d.getDate() + daysAhead);
    d.setHours(startTime.h, startTime.m, 0, 0);
    return d;
  }

  if (recurrence === "monthly") {
    if (!dayOfWeek || !(dayOfWeek in DAY_MAP)) return null;
    const targetDay = DAY_MAP[dayOfWeek];
    const weekOfMonth = evt["Week of month"];

    function findNthWeekday(year: number, month: number, weekday: number, n: number | "last"): Date | null {
      if (n === "last" || String(n).toLowerCase() === "last") {
        // Find last occurrence
        const lastDay = new Date(year, month + 1, 0);
        let d = lastDay.getDate();
        while (d > 0) {
          const test = new Date(year, month, d);
          if (test.getDay() === weekday) {
            test.setHours(startTime!.h, startTime!.m, 0, 0);
            return test;
          }
          d--;
        }
        return null;
      }

      const nth = typeof n === "string" ? parseInt(n) : n;
      if (isNaN(nth) || nth < 1 || nth > 5) return null;

      let count = 0;
      for (let day = 1; day <= 31; day++) {
        const test = new Date(year, month, day);
        if (test.getMonth() !== month) break;
        if (test.getDay() === weekday) {
          count++;
          if (count === nth) {
            test.setHours(startTime!.h, startTime!.m, 0, 0);
            return test;
          }
        }
      }
      return null;
    }

    // Try current month first
    let result = findNthWeekday(now.getFullYear(), now.getMonth(), targetDay, weekOfMonth as any ?? 1);
    if (result && result > now) return result;

    // Try next month
    const nextMonth = now.getMonth() + 1;
    const nextYear = nextMonth > 11 ? now.getFullYear() + 1 : now.getFullYear();
    result = findNthWeekday(nextYear, nextMonth % 12, targetDay, weekOfMonth as any ?? 1);
    return result;
  }

  // Fallback: treat as weekly if day_of_week is present
  if (dayOfWeek && dayOfWeek in DAY_MAP) {
    const targetDay = DAY_MAP[dayOfWeek];
    let daysAhead = targetDay - now.getDay();
    if (daysAhead < 0) daysAhead += 7;
    const d = new Date(now);
    d.setDate(d.getDate() + daysAhead);
    d.setHours(startTime.h, startTime.m, 0, 0);
    return d;
  }

  return null;
}

/** Map age min/max to the app's age_groups enum values. */
function mapAgeGroups(ageMin?: number, ageMax?: number): Activity["age_groups"] {
  if (ageMin == null && ageMax == null) return [];
  const lo = ageMin ?? 0;
  const hi = ageMax ?? 6;
  const groups: Activity["age_groups"] = [];
  if (lo <= 0 && hi >= 0) groups.push("0-6 months");
  if (lo <= 0 && hi >= 1) groups.push("6-12 months");
  if (lo <= 1 && hi >= 1) groups.push("1-2 years");
  if (lo <= 2 && hi >= 2) groups.push("2-3 years");
  if (hi >= 3) groups.push("3+ years");
  return groups;
}

/** Data quality check — event must have required fields. */
function isValidEvent(evt: AirtableEvent): boolean {
  if (!evt.Title?.trim()) return false;
  if (!evt["Start time"]) return false;
  if (!evt["End time"]) return false;
  // Venue: either lookup or resolved
  const venueName = evt._venue_resolved?.Name || unwrap(evt["Address (lookup)"]);
  if (!venueName && !evt.Venue?.length) return false;
  return true;
}

/** Check if event is approved/active. */
function isActiveEvent(evt: AirtableEvent): boolean {
  if (evt.Status === "approved") return true;
  if (evt["Is active"] === true) return true;
  return false;
}

/** Check if event is within 0-6 age range. */
function isInAgeRange(evt: AirtableEvent): boolean {
  const ageMin = evt["Age min"];
  const ageMax = evt["Age max"];
  // If no age info, include it (could be for all ages)
  if (ageMin == null && ageMax == null) return true;
  const lo = ageMin ?? 0;
  // If minimum age is > 6, exclude
  if (lo > 6) return false;
  return true;
}

// ─── Main fetch ────────────────────────────────────────────────────────────

let cachedPromise: Promise<AirtableEvent[]> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 3 * 60 * 1000; // 3 min — React Query also caches

export function clearAirtableCache() {
  cachedPromise = null;
  cacheTimestamp = 0;
}

async function fetchAirtableEvents(): Promise<AirtableEvent[]> {
  const now = Date.now();
  if (cachedPromise && now - cacheTimestamp < CACHE_TTL) return cachedPromise;

  cacheTimestamp = now;
  cachedPromise = (async () => {
    const { data, error } = await supabase.functions.invoke("airtable-proxy");
    if (error) throw new Error(`Airtable fetch failed: ${error.message}`);
    return (data?.events ?? []) as AirtableEvent[];
  })();

  return cachedPromise;
}

// ─── Public API ────────────────────────────────────────────────────────────

export interface AirtableActivity extends Omit<Activity, "submitted_by" | "submitter_email" | "submitter_name"> {
  submitted_by: string | null;
  submitter_email: string | null;
  submitter_name: string | null;
  _distance?: number | null;
  _nextOccurrence?: Date | null;
  _ageLabel?: string | null;
  _sponsored?: boolean;
  _registrationLink?: string | null;
  _verifiedAt?: string | null;
  _recurrenceType?: string | null;
  _dayOfWeek?: string | null;
}

export async function loadAirtableActivities(): Promise<AirtableActivity[]> {
  const raw = await fetchAirtableEvents();

  return raw
    .filter(isActiveEvent)
    .filter(isValidEvent)
    .filter(isInAgeRange)
    .map((evt) => {
      const nextOccurrence = computeNextOccurrence(evt);
      const startTimeParsed = parseTime(evt["Start time"]);
      const endTimeParsed = parseTime(evt["End time"]);

      // Build start/end as ISO strings
      let startDate: Date;
      let endDate: Date | null = null;

      if (nextOccurrence) {
        startDate = nextOccurrence;
        if (endTimeParsed) {
          endDate = new Date(nextOccurrence);
          endDate.setHours(endTimeParsed.h, endTimeParsed.m, 0, 0);
        }
      } else {
        // Fallback: use today's date with the time
        startDate = new Date();
        if (startTimeParsed) {
          startDate.setHours(startTimeParsed.h, startTimeParsed.m, 0, 0);
        }
        if (endTimeParsed) {
          endDate = new Date(startDate);
          endDate.setHours(endTimeParsed.h, endTimeParsed.m, 0, 0);
        }
      }

      // Resolve venue info from lookups or resolved venue
      const venueName = evt._venue_resolved?.Name ?? "Unbekannter Ort";
      const address = unwrap(evt["Address (lookup)"]) ?? evt._venue_resolved?.Address ?? null;
      const districtRaw = unwrap(evt["District (lookup)"]) ?? evt._venue_resolved?.District ?? null;
      const district = (districtRaw && VALID_DISTRICTS.includes(districtRaw)
        ? districtRaw
        : "Mitte") as BerlinDistrict;
      const latitude = unwrap(evt["Latitude (lookup)"]) ?? evt._venue_resolved?.Latitude ?? null;
      const longitude = unwrap(evt["Longitude (lookup)"]) ?? evt._venue_resolved?.Longitude ?? null;

      // Price
      const isFree = evt["Price type"] === "free" || !evt["Price type"];
      const priceInfo = evt.Price != null && !isFree ? `${evt.Price} €` : null;

      // Age
      const ageGroups = mapAgeGroups(evt["Age min"], evt["Age max"]);
      const ageLabel = evt["Age label"] ?? null;

      // Stable ID from airtable record ID
      const id = evt.airtable_id;

      const recurrenceType = evt["Recurrence type"] ?? null;
      const isRecurring = recurrenceType === "weekly" || recurrenceType === "monthly";

      return {
        id,
        title: evt.Title!,
        description: evt.Description ?? null,
        start_time: startDate.toISOString(),
        end_time: endDate?.toISOString() ?? null,
        location_name: venueName,
        address: address ?? null,
        district,
        age_groups: ageGroups,
        is_free: isFree,
        price_info: priceInfo,
        registration_required: evt["Registration required"] ?? false,
        registration_url: evt["Registration link"] ?? null,
        source: evt.Source ?? null,
        source_url: null,
        image_url: null,
        category: null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        recurring: isRecurring,
        recurrence_rule: evt["Day of week"] ?? null,
        is_approved: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        submitted_by: null,
        submitter_email: null,
        submitter_name: null,
        _nextOccurrence: nextOccurrence,
        _ageLabel: ageLabel,
        _sponsored: evt.Sponsored ?? false,
        _registrationLink: evt["Registration link"] ?? null,
        _verifiedAt: evt["Verified at"] ?? null,
        _recurrenceType: recurrenceType,
        _dayOfWeek: evt["Day of week"] ?? null,
      } as AirtableActivity;
    })
    .filter((a) => a._nextOccurrence !== null || a.start_time) // must have a valid time
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
}
