import { useRef } from "react";
import { BERLIN_DISTRICTS, AGE_GROUPS, type SearchFilters } from "@/lib/types";
import { getAgeLabel } from "@/lib/utils";

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

  const setDistrict = (d?: string) => {
    onChange({ ...filters, district: d as SearchFilters["district"] });
  };

  const setAge = (a?: string) => {
    onChange({ ...filters, ageGroup: a as SearchFilters["ageGroup"] });
  };

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-hide"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* Free filter */}
      <button
        className={`filter-chip ${filters.isFree === true ? "active" : ""}`}
        onClick={toggleFree}
      >
        Kostenlos
      </button>

      {/* No registration */}
      <button
        className={`filter-chip ${filters.registrationRequired === false ? "active" : ""}`}
        onClick={toggleNoRegistration}
      >
        Ohne Anmeldung
      </button>

      {/* District dropdown-style chips */}
      {BERLIN_DISTRICTS.map((d) => (
        <button
          key={d}
          className={`filter-chip ${filters.district === d ? "active" : ""}`}
          onClick={() => setDistrict(filters.district === d ? undefined : d)}
        >
          {d}
        </button>
      ))}

      {/* Age chips */}
      {AGE_GROUPS.map((a) => (
        <button
          key={a}
          className={`filter-chip ${filters.ageGroup === a ? "active" : ""}`}
          onClick={() => setAge(filters.ageGroup === a ? undefined : a)}
        >
          {getAgeLabel(a)}
        </button>
      ))}
    </div>
  );
}
