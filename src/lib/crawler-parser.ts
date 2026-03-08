import type { Activity } from "./types";

const VALID_DISTRICTS = [
  "Mitte", "Friedrichshain-Kreuzberg", "Pankow", "Charlottenburg-Wilmersdorf",
  "Spandau", "Steglitz-Zehlendorf", "Tempelhof-Schöneberg", "Neukölln",
  "Treptow-Köpenick", "Marzahn-Hellersdorf", "Lichtenberg", "Reinickendorf",
];

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

interface CrawlerOverride {
  event_key: string;
  hidden: boolean;
  paused_until: string | null;
  title_override: string | null;
  description_override: string | null;
  age_override: string | null;
  district_override: string | null;
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
    const d = new Date(now);
    d.setHours(h, m, 0, 0);
    return d;
  }

  const targetDay = DAY_MAP[dayOfWeek];
  const currentDay = now.getDay();
  let daysAhead = targetDay - currentDay;
  if (daysAhead < 0) daysAhead += 7;

  const d = new Date(now);
  d.setDate(d.getDate() + daysAhead);
  d.setHours(h, m, 0, 0);
  return d;
}

export function parseRawEvents(
  events: RawEvent[],
  overrides: Map<string, CrawlerOverride>
): Activity[] {
  const now = new Date();

  return events
    .filter((e) => !isLowQuality(e.title))
    .map((e) => {
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

      const idSource = `${e.title}|${e.venue_name}|${e.start_time}`;
      let hash = 0;
      for (let c = 0; c < idSource.length; c++) {
        hash = ((hash << 5) - hash + idSource.charCodeAt(c)) | 0;
      }
      const stableId = `evt-${Math.abs(hash).toString(36)}`;

      const override = overrides.get(stableId);
      if (override?.hidden) return null;
      if (override?.paused_until && new Date(override.paused_until) > now) return null;

      const finalTitle = override?.title_override || e.title;
      const finalDescription = override?.description_override || null;
      const finalDistrict = override?.district_override && VALID_DISTRICTS.includes(override.district_override)
        ? override.district_override as Activity["district"]
        : district;
      const finalAgeGroups = override?.age_override
        ? parseAgeGroups(override.age_override)
        : parseAgeGroups(e.age);

      return {
        id: stableId,
        title: finalTitle,
        description: finalDescription,
        start_time: nextStart.toISOString(),
        end_time: nextEnd ? nextEnd.toISOString() : null,
        location_name: e.venue_name,
        address: e.address ?? null,
        district: finalDistrict,
        age_groups: finalAgeGroups,
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
    .filter((e): e is Activity => e !== null)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}
