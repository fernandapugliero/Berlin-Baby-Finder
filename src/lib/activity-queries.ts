/**
 * Activity queries — powered by Airtable as the single source of truth.
 */
import { supabase } from "@/integrations/supabase/client";
import type { SearchFilters } from "./types";
import { getTimeRange, haversineDistance } from "./search-filters";
import { loadAirtableActivities, type AirtableActivity } from "./airtable";

// Re-export for backward compatibility
export { formatDistance } from "./search-filters";

export async function searchActivities(filters: SearchFilters) {
  const allEvents = await loadAirtableActivities();
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
        "3-6": ["3+ years"],
        "3+": ["3+ years"],
        "0-6": ["0-6 months", "6-12 months", "1-2 years", "2-3 years", "3+ years"],
      };
      const targets = ageMap[filters.ageGroup!] || [filters.ageGroup];
      return a.age_groups.some((g) => targets.includes(g));
    });
  }

  if (filters.district) {
    results = results.filter((a) => a.district === filters.district);
  }

  if (filters.isFree === true) {
    results = results.filter((a) => a.is_free);
  }

  if (filters.registrationRequired === false) {
    results = results.filter((a) => !a.registration_required);
  }

  const hasUserLocation = filters.nearLat != null && filters.nearLng != null;

  const withDistance = results.map((a) => {
    let _distance: number | null = null;
    if (hasUserLocation && a.latitude != null && a.longitude != null) {
      _distance = haversineDistance(filters.nearLat!, filters.nearLng!, a.latitude, a.longitude);
    }
    return { ...a, _distance };
  });

  // Sort: free first, then by distance (if available) or time
  withDistance.sort((a, b) => {
    if (a.is_free !== b.is_free) return a.is_free ? -1 : 1;

    if (hasUserLocation) {
      if (a._distance == null && b._distance == null) return 0;
      if (a._distance == null) return 1;
      if (b._distance == null) return -1;
      return a._distance - b._distance;
    }

    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  return withDistance;
}

export async function fetchAllActivities(): Promise<AirtableActivity[]> {
  return loadAirtableActivities();
}

export async function fetchAllCrawlerEventsForAdmin(): Promise<AirtableActivity[]> {
  return loadAirtableActivities();
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
