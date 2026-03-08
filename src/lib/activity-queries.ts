import type { SearchFilters, Activity } from "./types";

const JSON_URL =
  "https://raw.githubusercontent.com/fernandapugliero/rausi-crawler/main/output.json";

interface RawEvent {
  title: string;
  start_time: string;
  end_time: string | null;
  age: string | null;
  day_of_week: string | null;
  district: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  source_name: string;
  source_url: string;
  venue_name: string;
}

function isLowQuality(title: string): boolean {
  if (title.length < 4) return true;
  if (/^Uhr/i.test(title.trim())) return true;
  if (/^und\s/i.test(title.trim())) return true;
  return false;
}

function parseAgeGroups(age: string | null): Activity["age_groups"] {
  if (!age) return [];
  const match = age.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (match) {
    const low = parseInt(match[1]);
    const high = parseInt(match[2]);
    const groups: Activity["age_groups"] = [];
    if (low === 0 && high <= 1) groups.push("0-6 months", "6-12 months");
    else if (low === 0) {
      groups.push("0-6 months", "6-12 months");
      if (high >= 2) groups.push("1-2 years");
      if (high >= 3) groups.push("2-3 years");
      if (high > 3) groups.push("3+ years");
    } else if (low >= 1 && high <= 3) {
      groups.push("1-2 years");
      if (high >= 3) groups.push("2-3 years");
    } else if (low >= 3) {
      groups.push("3+ years");
    }
    return groups;
  }
  return [];
}

function todayWithTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

let cachedEvents: Activity[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10 * 60 * 1000;

async function loadEvents(): Promise<Activity[]> {
  if (cachedEvents && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedEvents;
  }

  const res = await fetch(JSON_URL);
  if (!res.ok) throw new Error("Failed to fetch events");
  const json = await res.json();
  const events: RawEvent[] = json.events ?? [];

  cachedEvents = events
    .filter((e) => !isLowQuality(e.title))
    .map((e, i) => ({
      id: `evt-${i}`,
      title: e.title,
      description: null,
      start_time: todayWithTime(e.start_time),
      end_time: e.end_time ? todayWithTime(e.end_time) : null,
      location_name: e.venue_name,
      address: null,
      district: "Mitte" as const, // default since JSON has no district
      age_groups: parseAgeGroups(e.age),
      is_free: true,
      price_info: null,
      registration_required: false,
      registration_url: null,
      source: e.source_name,
      source_url: e.source_url,
      image_url: null,
      category: null,
      latitude: null,
      longitude: null,
      recurring: null,
      recurrence_rule: null,
      is_approved: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  cacheTimestamp = Date.now();
  return cachedEvents;
}

function getTimeRange(filter: SearchFilters["timeRange"], customDate?: Date) {
  const now = new Date();

  switch (filter) {
    case "now": {
      const end = new Date(now);
      end.setHours(end.getHours() + 3);
      return { start: now, end };
    }
    case "today": {
      const start = new Date(now);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case "tomorrow": {
      const start = new Date(now);
      start.setDate(start.getDate() + 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    case "custom": {
      if (!customDate) return { start: now, end: new Date(now.getTime() + 24 * 60 * 60 * 1000) };
      const start = new Date(customDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customDate);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
  }
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m entfernt`;
  return `${(meters / 1000).toFixed(1)} km entfernt`;
}

export async function searchActivities(filters: SearchFilters) {
  const allEvents = await loadEvents();
  const { start, end } = getTimeRange(filters.timeRange, filters.customDate);

  let results = allEvents.filter((a) => {
    const st = new Date(a.start_time);
    return st >= start && st <= end;
  });

  if (filters.ageGroup) {
    results = results.filter((a) => {
      // Map simple age filter to matching db age groups
      const ageMap: Record<string, string[]> = {
        "0-1": ["0-6 months", "6-12 months"],
        "1-3": ["1-2 years", "2-3 years"],
        "3+": ["3+ years"],
      };
      const targets = ageMap[filters.ageGroup!] || [filters.ageGroup];
      return a.age_groups.some((g) => targets.includes(g));
    });
  }

  return results.map((a) => ({ ...a, _distance: null as number | null }));
}

export async function fetchAllActivities() {
  return loadEvents();
}

export async function approveActivity(_id: string) {}
export async function deleteActivity(_id: string) {}
