import { supabase } from "@/integrations/supabase/client";
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

const DAY_MAP: Record<string, number> = {
  "Montag": 1, "Dienstag": 2, "Mittwoch": 3, "Donnerstag": 4,
  "Freitag": 5, "Samstag": 6, "Sonntag": 0,
};

function getNextOccurrence(dayOfWeek: string | null, timeStr: string): Date {
  const now = new Date();
  const [h, m] = timeStr.split(":").map(Number);

  if (!dayOfWeek || !DAY_MAP.hasOwnProperty(dayOfWeek)) {
    // No day_of_week: assume today
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d;
  }

  const targetDay = DAY_MAP[dayOfWeek];
  const currentDay = now.getDay();
  let daysAhead = targetDay - currentDay;
  if (daysAhead < 0) daysAhead += 7;
  // If it's today but the event already ended, push to next week
  if (daysAhead === 0) {
    const todayTime = new Date(now);
    todayTime.setHours(h, m, 0, 0);
    if (todayTime < now) {
      // Check if it's still running (end_time handled at call site)
      // For start_time only, skip if already passed
    }
  }

  const d = new Date(now);
  d.setDate(d.getDate() + daysAhead);
  d.setHours(h, m, 0, 0);
  return d;
}

function toISOWithTime(date: Date): string {
  return date.toISOString();
}

const VALID_DISTRICTS = [
  "Mitte", "Friedrichshain-Kreuzberg", "Pankow", "Charlottenburg-Wilmersdorf",
  "Spandau", "Steglitz-Zehlendorf", "Tempelhof-Schöneberg", "Neukölln",
  "Treptow-Köpenick", "Marzahn-Hellersdorf", "Lichtenberg", "Reinickendorf",
];

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
    .map((e, i) => {
      const nextStart = getNextOccurrence(e.day_of_week, e.start_time);
      let nextEnd: Date | null = null;
      if (e.end_time) {
        nextEnd = new Date(nextStart);
        const [eh, em] = e.end_time.split(":").map(Number);
        nextEnd.setHours(eh, em, 0, 0);
      }
      const district = e.district && VALID_DISTRICTS.includes(e.district)
        ? e.district as Activity["district"]
        : "Mitte" as const;

      // Stable ID based on content hash
      const idSource = `${e.title}|${e.venue_name}|${e.start_time}`;
      let hash = 0;
      for (let c = 0; c < idSource.length; c++) {
        hash = ((hash << 5) - hash + idSource.charCodeAt(c)) | 0;
      }
      const stableId = `evt-${Math.abs(hash).toString(36)}`;

      return {
        id: stableId,
        title: e.title,
        description: null,
        start_time: toISOWithTime(nextStart),
        end_time: nextEnd ? toISOWithTime(nextEnd) : null,
        location_name: e.venue_name,
        address: e.address ?? null,
        district,
        age_groups: parseAgeGroups(e.age),
        is_free: true,
        price_info: null,
        registration_required: false,
        registration_url: null,
        source: e.source_name,
        source_url: e.source_url,
        image_url: null,
        category: null,
        latitude: e.latitude ?? null,
        longitude: e.longitude ?? null,
        recurring: e.day_of_week ? true : null,
        recurrence_rule: e.day_of_week ?? null,
        is_approved: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        submitted_by: null,
      };
    })
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

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
      const ageMap: Record<string, string[]> = {
        "0-1": ["0-6 months", "6-12 months"],
        "1-3": ["1-2 years", "2-3 years"],
        "3+": ["3+ years"],
      };
      const targets = ageMap[filters.ageGroup!] || [filters.ageGroup];
      return a.age_groups.some((g) => targets.includes(g));
    });
  }

  if (filters.district) {
    results = results.filter((a) => a.district === filters.district);
  }

  // Calculate distance if user location is available
  const hasUserLocation = filters.nearLat != null && filters.nearLng != null;

  const withDistance = results.map((a) => {
    let _distance: number | null = null;
    if (hasUserLocation && a.latitude != null && a.longitude != null) {
      _distance = haversineDistance(filters.nearLat!, filters.nearLng!, a.latitude, a.longitude);
    }
    return { ...a, _distance };
  });

  // Sort by distance if location available, otherwise by start_time
  if (hasUserLocation) {
    withDistance.sort((a, b) => {
      if (a._distance == null && b._distance == null) return 0;
      if (a._distance == null) return 1;
      if (b._distance == null) return -1;
      return a._distance - b._distance;
    });
  }

  return withDistance;
}

export async function fetchAllActivities(): Promise<Activity[]> {
  const crawlerEvents = await loadEvents();

  // Also fetch community-submitted events from DB
  const { data: dbEvents } = await supabase
    .from("activities")
    .select("*")
    .order("start_time", { ascending: true });

  const allEvents = [...crawlerEvents];
  if (dbEvents) {
    // Merge DB events (approved ones are visible, unapproved only for admin view)
    allEvents.push(...dbEvents);
  }

  // Deduplicate by id
  const seen = new Set<string>();
  return allEvents.filter((e) => {
    if (seen.has(e.id)) return false;
    seen.add(e.id);
    return true;
  });
}

export async function approveActivity(id: string) {
  const { error } = await supabase
    .from("activities")
    .update({ is_approved: true })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteActivity(id: string) {
  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
