import { supabase } from "@/integrations/supabase/client";
import type { SearchFilters } from "./types";

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

/** Haversine distance in meters */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m entfernt`;
  return `${(meters / 1000).toFixed(1)} km entfernt`;
}

export async function searchActivities(filters: SearchFilters) {
  const { start, end } = getTimeRange(filters.timeRange, filters.customDate);

  let query = supabase
    .from("activities")
    .select("*")
    .gte("start_time", start.toISOString())
    .lte("start_time", end.toISOString())
    .order("start_time", { ascending: true });

  if (filters.district) {
    query = query.eq("district", filters.district);
  }
  if (filters.ageGroup) {
    query = query.contains("age_groups", [filters.ageGroup]);
  }
  if (filters.isFree !== undefined) {
    query = query.eq("is_free", filters.isFree);
  }
  if (filters.registrationRequired !== undefined) {
    query = query.eq("registration_required", filters.registrationRequired);
  }

  const { data, error } = await query;
  if (error) throw error;

  // If user location is available, compute distance and sort by proximity
  if (data && filters.nearLat != null && filters.nearLng != null) {
    const userLat = filters.nearLat;
    const userLng = filters.nearLng;
    const withDistance = data.map((a) => ({
      ...a,
      _distance:
        a.latitude != null && a.longitude != null
          ? haversineDistance(userLat, userLng, a.latitude, a.longitude)
          : null,
    }));
    withDistance.sort((a, b) => {
      if (a._distance == null && b._distance == null) return 0;
      if (a._distance == null) return 1;
      if (b._distance == null) return -1;
      return a._distance - b._distance;
    });
    return withDistance;
  }

  return data?.map((a) => ({ ...a, _distance: null as number | null })) ?? [];
}

export async function fetchAllActivities() {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
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
