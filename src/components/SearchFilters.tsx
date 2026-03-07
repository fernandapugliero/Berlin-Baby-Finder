import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BERLIN_DISTRICTS, AGE_GROUPS, type SearchFilters as Filters } from "@/lib/types";

interface SearchFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  open: boolean;
  onToggle: () => void;
}

export function SearchFiltersPanel({ filters, onChange, open, onToggle }: SearchFiltersProps) {
  const hasActiveFilters = filters.district || filters.ageGroup || filters.isFree !== undefined || filters.registrationRequired !== undefined;

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="gap-2 rounded-full"
      >
        <Filter className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <span className="w-2 h-2 rounded-full bg-accent" />
        )}
      </Button>

      {open && (
        <div className="mt-3 p-4 bg-card rounded-2xl border border-border space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold text-sm">Filters</span>
            <button onClick={onToggle} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">District</label>
              <Select
                value={filters.district || "all"}
                onValueChange={(v) =>
                  onChange({ ...filters, district: v === "all" ? undefined : v as Filters["district"] })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="All districts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All districts</SelectItem>
                  {BERLIN_DISTRICTS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Baby age</label>
              <Select
                value={filters.ageGroup || "all"}
                onValueChange={(v) =>
                  onChange({ ...filters, ageGroup: v === "all" ? undefined : v as Filters["ageGroup"] })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="All ages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ages</SelectItem>
                  {AGE_GROUPS.map((a) => (
                    <SelectItem key={a} value={a}>{a}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant={filters.isFree === true ? "default" : "outline"}
                size="sm"
                className="rounded-full flex-1"
                onClick={() =>
                  onChange({ ...filters, isFree: filters.isFree === true ? undefined : true })
                }
              >
                Free only
              </Button>
              <Button
                variant={filters.registrationRequired === false ? "default" : "outline"}
                size="sm"
                className="rounded-full flex-1"
                onClick={() =>
                  onChange({
                    ...filters,
                    registrationRequired: filters.registrationRequired === false ? undefined : false,
                  })
                }
              >
                No registration
              </Button>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() =>
                  onChange({
                    ...filters,
                    district: undefined,
                    ageGroup: undefined,
                    isFree: undefined,
                    registrationRequired: undefined,
                  })
                }
              >
                Clear all filters
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
