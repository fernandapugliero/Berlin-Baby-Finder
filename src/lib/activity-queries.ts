/**
 * Activity queries — powered by GitHub-hosted JSON as the single source of truth.
 */
import { supabase } from "@/integrations/supabase/client";
import type { SearchFilters } from "./types";
import { haversineDistance } from "./search-filters";
import { loadAirtableActivities, type AirtableActivity } from "./airtable";

export { formatDistance } from "./search-filters";

// ─── Section queries for home page ─────────────────────────────────────────

/** Events happening now or starting within the next 3 hours. */
export async function fetchJetztActivities(lat?: number, lng?: number): Promise<(AirtableActivity & { _distance?: number | null })[]> {
  const all = await loadAirtableActivities();
  const now = new Date();
  const in3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);

  const results = all.filter((a) => {
    const st = new Date(a.start_time);
    const et = a.end_time ? new Date(a.end_time) : null;
    // Currently running
    if (et && now >= st && now <= et) return true;
    if (!et && now >= st && now.getTime() - st.getTime() < 2 * 60 * 60 * 1000) return true;
    // Starting within 3h
    if (st > now && st <= in3h) return true;
    return false;
  });

  return addDistanceAndSort(results, lat, lng);
}

/** All events happening today. */
export async function fetchHeuteActivities(lat?: number, lng?: number): Promise<(AirtableActivity & { _distance?: number | null })[]> {
  const all = await loadAirtableActivities();
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const results = all.filter((a) => {
    const st = new Date(a.start_time);
    return st >= todayStart && st <= todayEnd;
  });

  return addDistanceAndSort(results, lat, lng);
}

/** All events happening tomorrow. */
export async function fetchMorgenActivities(lat?: number, lng?: number): Promise<(AirtableActivity & { _distance?: number | null })[]> {
  const all = await loadAirtableActivities();
  const now = new Date();
  const tomorrowStart = new Date(now);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const results = all.filter((a) => {
    const st = new Date(a.start_time);
    return st >= tomorrowStart && st <= tomorrowEnd;
  });

  return addDistanceAndSort(results, lat, lng);
}

// ─── Legacy search (used by search results view) ──────────────────────────

export async function searchActivities(filters: SearchFilters) {
  const all = await loadAirtableActivities();
  const now = new Date();

  let results: AirtableActivity[];

  switch (filters.timeRange) {
    case "now": {
      const in3h = new Date(now.getTime() + 3 * 60 * 60 * 1000);
      results = all.filter((a) => {
        const st = new Date(a.start_time);
        const et = a.end_time ? new Date(a.end_time) : null;
        if (et && now >= st && now <= et) return true;
        if (!et && now >= st && now.getTime() - st.getTime() < 2 * 60 * 60 * 1000) return true;
        if (st > now && st <= in3h) return true;
        return false;
      });
      break;
    }
    case "today": {
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      results = all.filter((a) => {
        const st = new Date(a.start_time);
        return st >= now && st <= todayEnd;
      });
      break;
    }
    case "tomorrow": {
      const tmrStart = new Date(now);
      tmrStart.setDate(tmrStart.getDate() + 1);
      tmrStart.setHours(0, 0, 0, 0);
      const tmrEnd = new Date(tmrStart);
      tmrEnd.setHours(23, 59, 59, 999);
      results = all.filter((a) => {
        const st = new Date(a.start_time);
        return st >= tmrStart && st <= tmrEnd;
      });
      break;
    }
    case "custom": {
      if (!filters.customDate) {
        results = [];
        break;
      }
      const cStart = new Date(filters.customDate);
      cStart.setHours(0, 0, 0, 0);
      const cEnd = new Date(filters.customDate);
      cEnd.setHours(23, 59, 59, 999);
      results = all.filter((a) => {
        const st = new Date(a.start_time);
        return st >= cStart && st <= cEnd;
      });
      break;
    }
    default:
      results = all;
  }

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

  return addDistanceAndSort(results, filters.nearLat, filters.nearLng);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function addDistanceAndSort(
  results: AirtableActivity[],
  lat?: number,
  lng?: number,
): (AirtableActivity & { _distance?: number | null })[] {
  const hasLoc = lat != null && lng != null;

  const withDist = results.map((a) => {
    let _distance: number | null = null;
    if (hasLoc && a.latitude != null && a.longitude != null) {
      _distance = haversineDistance(lat!, lng!, a.latitude, a.longitude);
    }
    return { ...a, _distance };
  });

  withDist.sort((a, b) => {
    if (a.is_free !== b.is_free) return a.is_free ? -1 : 1;
    if (hasLoc) {
      if (a._distance == null && b._distance == null) return 0;
      if (a._distance == null) return 1;
      if (b._distance == null) return -1;
      return a._distance - b._distance;
    }
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });

  return withDist;
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
