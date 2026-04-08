/**
 * Activity data layer — powered by GitHub-hosted JSON.
 */
import type { BerlinDistrict } from "./types";

// ─── Raw JSON shape ────────────────────────────────────────────────────────
export interface RawJsonEvent {
  id: string;
  title: string;
  description: string | null;
  venue_name: string;
  address: string | null;
  district: string;
  latitude: number | null;
  longitude: number | null;
  photo: string | null;
  day_of_week: string | null;
  recurrence_type: string | null; // "weekly" | "once"
  week_of_month: string[] | null;
  event_date: string | null;
  start_time: string; // "HH:MM" or ISO
  end_time: string | null;
  age_min: number | null;
  age_max: number | null;
  age_label: string | null;
  price_type: string | null; // "free" | "paid"
  price: string | null;
  registration_required: boolean;
  source: string | null;
  status: string;
  verified_at: string | null;
  is_active: string; // "active" | …
}

// ─── Normalised activity used throughout the app ───────────────────────────
export interface AirtableActivity {
  id: string;
  title: string;
  description: string | null;
  location_name: string;
  address: string | null;
  district: BerlinDistrict;
  latitude: number | null;
  longitude: number | null;
  image_url: string | null;
  start_time: string; // ISO datetime of next occurrence
  end_time: string | null; // ISO datetime
  age_groups: string[];
  is_free: boolean;
  price_info: string | null;
  registration_required: boolean;
  source: string | null;
  source_url: string | null;
  recurring: boolean;
  recurrence_rule: string | null;
  category: string | null;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  submitted_by: string | null;
  submitter_email: string | null;
  submitter_name: string | null;
  // Extra fields for UI
  _distance?: number | null;
  _nextOccurrence?: Date | null;
  _ageLabel?: string | null;
  _sponsored?: boolean;
  _registrationLink?: string | null;
  _verifiedAt?: string | null;
  _recurrenceType?: string | null;
  _dayOfWeek?: string | null;
}

// ─── Constants ─────────────────────────────────────────────────────────────
const JSON_URL =
  "https://raw.githubusercontent.com/SEU-USUARIO/SEU-REPO/main/data.json";

const DAY_MAP: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
  Thursday: 4, Friday: 5, Saturday: 6,
  Sonntag: 0, Montag: 1, Dienstag: 2, Mittwoch: 3,
  Donnerstag: 4, Freitag: 5, Samstag: 6,
};

// ─── Cache ─────────────────────────────────────────────────────────────────
let _cache: AirtableActivity[] | null = null;
let _cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

export function clearAirtableCache() {
  _cache = null;
  _cacheTime = 0;
}

// ─── Recurrence helpers ────────────────────────────────────────────────────

/** Get next date matching a weekday, on or after `from`. */
function nextWeekday(dayName: string, from: Date): Date {
  const target = DAY_MAP[dayName];
  if (target == null) return from;
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const diff = (target - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 0 : diff));
  return d;
}

/** Get the Nth weekday of a given month. week is 1-based. */
function nthWeekdayOfMonth(year: number, month: number, dayIndex: number, week: number): Date {
  const first = new Date(year, month, 1);
  const firstDay = first.getDay();
  let date = 1 + ((dayIndex - firstDay + 7) % 7) + (week - 1) * 7;
  return new Date(year, month, date);
}

/**
 * Compute the next occurrence(s) of an event within a horizon (today + 14 days).
 * Returns ISO date-time strings.
 */
function computeOccurrences(
  raw: RawJsonEvent,
  horizonStart: Date,
  horizonEnd: Date,
): { start: string; end: string | null }[] {
  const results: { start: string; end: string | null }[] = [];

  const [sh, sm] = (raw.start_time || "00:00").split(":").map(Number);
  const [eh, em] = raw.end_time ? raw.end_time.split(":").map(Number) : [null, null];

  function makeDateTime(date: Date, h: number, m: number): string {
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  }

  function makeEnd(date: Date): string | null {
    if (eh == null || em == null) return null;
    return makeDateTime(date, eh, em);
  }

  // Weekly recurring
  if (raw.recurrence_type === "weekly" && raw.day_of_week) {
    let d = nextWeekday(raw.day_of_week, horizonStart);
    while (d <= horizonEnd) {
      results.push({ start: makeDateTime(d, sh, sm), end: makeEnd(d) });
      d = new Date(d);
      d.setDate(d.getDate() + 7);
    }
    return results;
  }

  // Monthly recurring (once + week_of_month)
  if (raw.recurrence_type === "once" && raw.week_of_month && raw.week_of_month.length > 0 && raw.day_of_week) {
    const dayIdx = DAY_MAP[raw.day_of_week];
    if (dayIdx == null) return results;

    // Check current month and next month
    for (let mo = 0; mo <= 1; mo++) {
      const refDate = new Date(horizonStart);
      refDate.setMonth(refDate.getMonth() + mo);
      const year = refDate.getFullYear();
      const month = refDate.getMonth();

      for (const w of raw.week_of_month) {
        const weekNum = parseInt(w);
        if (isNaN(weekNum)) continue;
        const d = nthWeekdayOfMonth(year, month, dayIdx, weekNum);
        if (d >= horizonStart && d <= horizonEnd && d.getMonth() === month) {
          results.push({ start: makeDateTime(d, sh, sm), end: makeEnd(d) });
        }
      }
    }
    return results;
  }

  // One-time event
  if (raw.event_date) {
    const d = new Date(raw.event_date);
    if (!isNaN(d.getTime())) {
      // Set to start of day for comparison
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      
      if (dayEnd >= horizonStart && dayStart <= horizonEnd) {
        results.push({ start: makeDateTime(d, sh, sm), end: makeEnd(d) });
      }
    }
    return results;
  }

  return results;
}

// ─── Age helpers ───────────────────────────────────────────────────────────
function deriveAgeLabel(raw: RawJsonEvent): string | null {
  if (raw.age_label) return raw.age_label;
  if (raw.age_min != null && raw.age_max != null) return `${raw.age_min}–${raw.age_max} Jahre`;
  if (raw.age_min != null) return `ab ${raw.age_min} Jahre`;
  if (raw.age_max != null) return `bis ${raw.age_max} Jahre`;
  return null;
}

function deriveAgeGroups(raw: RawJsonEvent): string[] {
  const groups: string[] = [];
  const min = raw.age_min ?? 0;
  const max = raw.age_max ?? 99;
  if (min <= 0 && max >= 0) groups.push("0-6 months");
  if (min <= 0 && max >= 0.5) groups.push("6-12 months");
  if (min <= 1 && max >= 1) groups.push("1-2 years");
  if (min <= 2 && max >= 2) groups.push("2-3 years");
  if (max >= 3) groups.push("3+ years");
  return groups;
}

// ─── Main loader ───────────────────────────────────────────────────────────
export async function loadAirtableActivities(): Promise<AirtableActivity[]> {
  if (_cache && Date.now() - _cacheTime < CACHE_TTL) return _cache;

  const res = await fetch(JSON_URL);
  if (!res.ok) {
    console.error("Failed to fetch events JSON:", res.status);
    return [];
  }

  const json = await res.json();
  const rawEvents: RawJsonEvent[] = Array.isArray(json) ? json : json.events ?? json.data ?? [];

  const now = new Date();
  const horizonStart = new Date(now);
  horizonStart.setHours(0, 0, 0, 0);
  const horizonEnd = new Date(now);
  horizonEnd.setDate(horizonEnd.getDate() + 14);
  horizonEnd.setHours(23, 59, 59, 999);

  const activities: AirtableActivity[] = [];

  for (const raw of rawEvents) {
    // Filter: only approved + active
    if (raw.status !== "approved") continue;
    if (raw.is_active !== "active") continue;

    const occurrences = computeOccurrences(raw, horizonStart, horizonEnd);
    if (occurrences.length === 0) continue;

    const ageLabel = deriveAgeLabel(raw);
    const ageGroups = deriveAgeGroups(raw);
    const isFree = raw.price_type === "free";
    const isRecurring = raw.recurrence_type === "weekly" || (raw.week_of_month && raw.week_of_month.length > 0);

    for (const occ of occurrences) {
      activities.push({
        id: `${raw.id}__${occ.start}`,
        title: raw.title,
        description: raw.description,
        location_name: raw.venue_name,
        address: raw.address,
        district: raw.district as BerlinDistrict,
        latitude: raw.latitude,
        longitude: raw.longitude,
        image_url: raw.photo,
        start_time: occ.start,
        end_time: occ.end,
        age_groups: ageGroups,
        is_free: isFree,
        price_info: isFree ? null : raw.price || "Kostenpflichtig",
        registration_required: raw.registration_required ?? false,
        source: raw.source,
        source_url: null,
        recurring: !!isRecurring,
        recurrence_rule: raw.day_of_week || null,
        category: null,
        is_approved: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        submitted_by: null,
        submitter_email: null,
        submitter_name: null,
        _ageLabel: ageLabel,
        _recurrenceType: raw.recurrence_type,
        _dayOfWeek: raw.day_of_week,
        _verifiedAt: raw.verified_at,
        _sponsored: false,
      });
    }
  }

  // Sort by start_time
  activities.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  _cache = activities;
  _cacheTime = Date.now();
  return activities;
}
