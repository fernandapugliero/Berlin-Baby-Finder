import { useState } from "react";
import { MapPin, Navigation, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface LocationFilterProps {
  onNearMe: (lat: number, lng: number) => void;
  onSearchLocation: (query: string) => void;
  isLocating?: boolean;
  activeLocation?: string;
}

export function LocationFilter({ onNearMe, onSearchLocation, isLocating, activeLocation }: LocationFilterProps) {
  const [query, setQuery] = useState("");

  const handleNearMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => onNearMe(pos.coords.latitude, pos.coords.longitude),
      () => alert("Standort konnte nicht ermittelt werden."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSearch = () => {
    if (query.trim()) onSearchLocation(query.trim());
  };

  return (
    <div className="space-y-2">
      {activeLocation && (
        <div className="flex items-center gap-2 text-sm text-secondary font-semibold">
          <MapPin className="w-4 h-4" />
          <span>{activeLocation}</span>
        </div>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleNearMe}
          disabled={isLocating}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 shrink-0"
        >
          <Navigation className="w-4 h-4" />
          {isLocating ? "Suche…" : "In der Nähe"}
        </button>
        <div className="flex-1 flex gap-1.5">
          <Input
            placeholder="Kiez oder PLZ"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="rounded-xl border-border bg-card text-sm h-10"
          />
          <button
            onClick={handleSearch}
            className="px-3 rounded-xl bg-primary text-primary-foreground shrink-0 transition-all active:scale-95"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
