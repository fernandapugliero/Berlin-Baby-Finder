import { useRef } from "react";
import type { SearchFilters } from "@/lib/types";

const SIMPLE_AGE_GROUPS = ["0-1", "1-3", "3-6"] as const;
type SimpleAge = typeof SIMPLE_AGE_GROUPS[number];

interface FilterChipsProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
}

export function FilterChips({ filters, onChange }: FilterChipsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const toggleFree = () => {
    onChange({ ...filters, isFree: filters.isFree === true ? undefined : true });
  };

  const toggleNoRegistration = () => {
    onChange({
      ...filters,
      registrationRequired: filters.registrationRequired === false ? undefined : false,
    });
  };

  const setAge = (a?: string) => {
    onChange({ ...filters, ageGroup: a as SearchFilters["ageGroup"] });
  };

  const ageLabels: Record<SimpleAge, string> = {
    "0-1": "0–1 J.",
    "1-3": "1–3 J.",
    "3+": "3+ J.",
  };

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <button
        className={`filter-chip ${filters.isFree === true ? "active" : ""}`}
        onClick={toggleFree}
      >
        Kostenlos
      </button>

      <button
        className={`filter-chip ${filters.registrationRequired === false ? "active" : ""}`}
        onClick={toggleNoRegistration}
      >
        Ohne Anmeldung
      </button>

      {SIMPLE_AGE_GROUPS.map((a) => (
        <button
          key={a}
          className={`filter-chip ${filters.ageGroup === a ? "active" : ""}`}
          onClick={() => setAge(filters.ageGroup === a ? undefined : a)}
        >
          {ageLabels[a]}
        </button>
      ))}
    </div>
  );
}
