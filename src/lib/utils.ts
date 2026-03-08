import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInMinutes, isToday, isTomorrow, format } from "date-fns";
import { de } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRelativeTimeLabel(startTime: Date, endTime?: Date | null): { label: string; type: "live" | "soon" | "normal" } {
  const now = new Date();
  const diffMin = differenceInMinutes(startTime, now);

  if (endTime && now >= startTime && now <= endTime) {
    return { label: "Läuft gerade", type: "live" };
  }
  if (now >= startTime && !endTime) {
    return { label: "Läuft gerade", type: "live" };
  }
  if (diffMin > 0 && diffMin <= 120) {
    return { label: `Beginnt in ${diffMin} Min.`, type: "soon" };
  }
  return { label: "", type: "normal" };
}

export function formatActivityTime(startTime: Date, endTime?: Date | null): string {
  const timeStr = format(startTime, "HH:mm");
  const endStr = endTime ? ` – ${format(endTime, "HH:mm")}` : "";
  
  if (isToday(startTime)) {
    return `${timeStr}${endStr} · Heute`;
  }
  if (isTomorrow(startTime)) {
    return `${timeStr}${endStr} · Morgen`;
  }
  return `${timeStr}${endStr} · ${format(startTime, "EEE, dd. MMM", { locale: de })}`;
}

export function getAgeLabel(age: string): string {
  const map: Record<string, string> = {
    "0-1": "0–1 J.",
    "1-3": "1–3 J.",
    "3+": "3+ J.",
    "0-6 months": "0–1 J.",
    "6-12 months": "0–1 J.",
    "1-2 years": "1–3 J.",
    "2-3 years": "1–3 J.",
    "3+ years": "3+ J.",
  };
  return map[age] || age;
}

export function getCategoryIcon(category?: string | null): string {
  if (!category) return "";
  const map: Record<string, string> = {
    kreativ: "🎨",
    musik: "🎵",
    krabbelgruppe: "🧸",
    draußen: "🌳",
    sport: "⚽",
    lesen: "📚",
  };
  return map[category.toLowerCase()] || "";
}
