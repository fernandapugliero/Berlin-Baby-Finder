import { MapPin } from "lucide-react";

interface DistrictFilterProps {
  value?: string;
  onChange: (district: string | undefined) => void;
}

const DISTRICTS = [
  { value: undefined, label: "Ganz Berlin" },
  { value: "Neukölln", label: "Neukölln" },
  { value: "Friedrichshain-Kreuzberg", label: "Kreuzberg" },
  { value: "Friedrichshain-Kreuzberg", label: "Friedrichshain" },
  { value: "Pankow", label: "Prenzlauer Berg" },
  { value: "Mitte", label: "Mitte" },
  { value: "Charlottenburg-Wilmersdorf", label: "Charlottenburg" },
];

export function DistrictFilter({ value, onChange }: DistrictFilterProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
        <MapPin className="w-4 h-4" />
        <span>Bezirk auswählen</span>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-5 px-5">
        {DISTRICTS.map((d, i) => (
          <button
            key={`${d.label}-${i}`}
            className={`filter-chip ${value === d.value && d.value !== undefined ? "active" : ""} ${!d.value && !value ? "active" : ""}`}
            onClick={() => onChange(d.value)}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}
