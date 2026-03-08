export interface RawEvent {
  title: string;
  start_time: string; // "HH:MM"
  end_time: string | null;
  age: string | null;
  source_name: string;
  source_url: string;
  venue_name: string;
}

export interface CrawledEvent extends RawEvent {
  id: string;
  ageGroup: "0-1" | "1-3" | "3-6" | null;
}

const JSON_URL =
  "https://raw.githubusercontent.com/fernandapugliero/rausi-crawler/main/output.json";

function isLowQuality(title: string): boolean {
  if (title.length < 4) return true;
  if (/^Uhr/i.test(title.trim())) return true;
  if (/^und\s/i.test(title.trim())) return true;
  return false;
}

function parseAgeGroup(age: string | null): CrawledEvent["ageGroup"] {
  if (!age) return null;
  // Match patterns like "0-1 Jahr", "0-3 Jahre", "1-2 Jahre", etc.
  const match = age.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (match) {
    const low = parseInt(match[1]);
    const high = parseInt(match[2]);
    if (high <= 1) return "0-1";
    if (low <= 1 && high <= 3) return "0-1"; // 0-3 includes babies
    if (low >= 0 && high <= 3) return "1-3";
    if (low >= 3 || high > 3) return "3-6";
  }
  // "ab 2 Jahre" etc
  if (/ab\s*(\d+)/i.test(age)) {
    const n = parseInt(age.match(/ab\s*(\d+)/i)![1]);
    if (n >= 3) return "3-6";
    if (n >= 1) return "1-3";
    return "0-1";
  }
  return null;
}

// More granular age group assignment for overlapping ranges
function assignAgeGroups(age: string | null): CrawledEvent["ageGroup"][] {
  if (!age) return [];
  const match = age.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (match) {
    const low = parseInt(match[1]);
    const high = parseInt(match[2]);
    const groups: CrawledEvent["ageGroup"][] = [];
    if (low <= 1) groups.push("0-1");
    if ((low <= 3 && high >= 1) || (low >= 1 && low <= 3)) groups.push("1-3");
    if (high > 3 || low >= 3) groups.push("3-6");
    return groups.length ? groups : [parseAgeGroup(age)].filter(Boolean) as CrawledEvent["ageGroup"][];
  }
  const single = parseAgeGroup(age);
  return single ? [single] : [];
}

export { assignAgeGroups };

export async function fetchCrawledEvents(): Promise<CrawledEvent[]> {
  const res = await fetch(JSON_URL);
  if (!res.ok) throw new Error("Failed to fetch events");
  const json = await res.json();
  const events: RawEvent[] = json.events ?? [];

  return events
    .filter((e) => !isLowQuality(e.title))
    .map((e, i) => ({
      ...e,
      id: `evt-${i}`,
      ageGroup: parseAgeGroup(e.age),
    }))
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export type TimeFilter = "jetzt" | "nachmittag" | "morgen";
export type AgeFilter = "0-1" | "1-3" | "3-6";

export function filterEvents(
  events: CrawledEvent[],
  time?: TimeFilter | null,
  age?: AgeFilter | null
): CrawledEvent[] {
  let filtered = events;

  if (time === "jetzt") {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    filtered = filtered.filter((e) => {
      const [h, m] = e.start_time.split(":").map(Number);
      const startMin = h * 60 + m;
      // Show events starting in the next 3 hours or currently running
      if (e.end_time) {
        const [eh, em] = e.end_time.split(":").map(Number);
        const endMin = eh * 60 + em;
        return endMin > nowMinutes && startMin <= nowMinutes + 180;
      }
      return startMin >= nowMinutes && startMin <= nowMinutes + 180;
    });
  } else if (time === "nachmittag") {
    filtered = filtered.filter((e) => {
      const [h] = e.start_time.split(":").map(Number);
      return h >= 12 && h < 18;
    });
  }
  // "morgen" = show all (since we only have time-of-day data, not dates)

  if (age) {
    filtered = filtered.filter((e) => {
      const groups = assignAgeGroups(e.age);
      return groups.includes(age);
    });
  }

  return filtered;
}
