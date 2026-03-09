import { supabase } from "@/integrations/supabase/client";
import type { SearchFilters, Activity } from "./types";
import { parseRawEvents } from "./crawler-parser";
import { getTimeRange, haversineDistance } from "./search-filters";

// Re-export for backward compatibility
export { formatDistance } from "./search-filters";

const JSON_URL =
  "https://raw.githubusercontent.com/fernandapugliero/rausi-crawler/main/output.json";

interface CrawlerOverride {
  event_key: string;
  hidden: boolean;
  paused_until: string | null;
  title_override: string | null;
  description_override: string | null;
  age_override: string | null;
  district_override: string | null;
}

async function fetchOverrides(): Promise<Map<string, CrawlerOverride>> {
  const { data } = await supabase.from("crawler_overrides").select("*");
  const map = new Map<string, CrawlerOverride>();
  if (data) {
    for (const o of data) map.set(o.event_key, o as CrawlerOverride);
  }
  return map;
}

/**
 * Loads and parses crawler events. No manual cache — React Query handles
 * caching via staleTime in each consuming component.
 */
async function loadEvents(options?: { includeAll?: boolean }): Promise<Activity[]> {
  const [res, overrides] = await Promise.all([
    fetch(JSON_URL),
    fetchOverrides(),
  ]);
  if (!res.ok) throw new Error("Failed to fetch events");
  const json = await res.json();
  const events = json.events ?? [];

  return parseRawEvents(events, overrides, options);
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

  const hasUserLocation = filters.nearLat != null && filters.nearLng != null;

  const withDistance = results.map((a) => {
    let _distance: number | null = null;
    if (hasUserLocation && a.latitude != null && a.longitude != null) {
      _distance = haversineDistance(filters.nearLat!, filters.nearLng!, a.latitude, a.longitude);
    }
    return { ...a, _distance };
  });

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

export async function fetchAllCrawlerEventsForAdmin(): Promise<Activity[]> {
  return loadEvents({ includeAll: true });
}

export async function fetchAllActivities(): Promise<Activity[]> {
  const crawlerEvents = await loadEvents();

  const { data: dbEvents } = await supabase
    .from("activities")
    .select("*")
    .order("start_time", { ascending: true });

  const allEvents = [...crawlerEvents];
  if (dbEvents) {
    allEvents.push(...dbEvents);
  }

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
