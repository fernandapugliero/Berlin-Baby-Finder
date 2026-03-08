import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Link } from "react-router-dom";
import { QuickActions } from "@/components/QuickActions";
import { FilterChips } from "@/components/FilterChips";
import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState } from "@/components/EmptyState";
import { LocationFilter } from "@/components/LocationFilter";
import { searchActivities } from "@/lib/activity-queries";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useBookmarks } from "@/hooks/use-bookmarks";
import type { SearchFilters } from "@/lib/types";

const Index = () => {
  const [filters, setFilters] = useState<SearchFilters>({ timeRange: "now" });
  const [hasSearched, setHasSearched] = useState(false);
  const [customDate, setCustomDate] = useState<Date | undefined>();
  const [isLocating, setIsLocating] = useState(false);
  const [activeLocation, setActiveLocation] = useState<string>();
  const { toggle, isBookmarked } = useBookmarks();

  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities", filters],
    queryFn: () => searchActivities(filters),
    enabled: hasSearched,
  });

  const handleQuickAction = (timeRange: SearchFilters["timeRange"]) => {
    setFilters((f) => ({ ...f, timeRange }));
    setHasSearched(true);
  };

  const handleNearMe = (lat: number, lng: number) => {
    setIsLocating(false);
    setActiveLocation("In der Nähe");
    setFilters((f) => ({ ...f, nearLat: lat, nearLng: lng, locationQuery: undefined, district: undefined }));
  };

  const handleSearchLocation = (query: string) => {
    setActiveLocation(query);
    setFilters((f) => ({ ...f, locationQuery: query, nearLat: undefined, nearLng: undefined, district: undefined }));
  };

  const handleCustomDate = (date: Date | undefined) => {
    setCustomDate(date);
    if (date) {
      setFilters((f) => ({ ...f, timeRange: "custom", customDate: date }));
      setHasSearched(true);
    }
  };

  const timeLabels: Record<string, string> = {
    now: "Jetzt verfügbar",
    today_afternoon: "Heute Nachmittag",
    tomorrow_morning: "Morgen Vormittag",
    custom: customDate ? format(customDate, "EEEE, dd. MMMM", { locale: de }) : "Ergebnisse",
  };

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <header className="px-5 pt-8 pb-2 flex items-center justify-between">
        <Link to="/" onClick={() => { setHasSearched(false); setFilters({ timeRange: "now" }); }}>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            🟠 Rausi
          </h1>
        </Link>
      </header>

      <div className="px-5 space-y-8">
        {/* Hero */}
        {!hasSearched && (
          <section className="pt-6 pb-2">
            <h2 className="font-display font-bold text-4xl leading-[1.15] text-foreground tracking-tight">
              Was machen mit{" "}
              <span className="hero-highlight">Kindern</span>{" "}
              in Berlin?
            </h2>
            <p className="text-base text-muted-foreground mt-4 leading-relaxed max-w-sm">
              Finde Aktivitäten in deinem Kiez – genau dann, wenn du raus willst.
            </p>
          </section>
        )}

        {/* Quick Actions */}
        {!hasSearched && (
          <section className="space-y-3">
            <QuickActions onSelect={handleQuickAction} />
            
            {/* Custom date picker */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="quick-action-btn w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <span className="font-display font-semibold text-base text-card-foreground block">
                        Anderes Datum
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {customDate 
                          ? format(customDate, "EEEE, dd. MMM", { locale: de })
                          : "Wähle ein Datum"}
                      </span>
                    </div>
                  </div>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customDate}
                  onSelect={handleCustomDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </section>
        )}

        {/* Compact header when searched */}
        {hasSearched && (
          <section className="pt-2">
            <h2 className="font-display font-bold text-2xl leading-tight text-foreground">
              Was machen mit{" "}
              <span className="hero-highlight">Kindern</span>?
            </h2>
          </section>
        )}

        {/* Time range tabs when searched */}
        {hasSearched && (
          <section className="flex gap-2 overflow-x-auto -mx-5 px-5 scrollbar-hide pb-1">
            {(["now", "today_afternoon", "tomorrow_morning"] as const).map((key) => (
              <button
                key={key}
                className={`filter-chip ${filters.timeRange === key ? "active" : ""}`}
                onClick={() => handleQuickAction(key)}
              >
                {({ now: "⚡ Jetzt", today_afternoon: "☀️ Heute PM", tomorrow_morning: "🌅 Morgen VM" } as const)[key]}
              </button>
            ))}
            <Popover>
              <PopoverTrigger asChild>
                <button className={`filter-chip ${filters.timeRange === "custom" ? "active" : ""}`}>
                  📅 {customDate ? format(customDate, "dd. MMM", { locale: de }) : "Datum"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customDate}
                  onSelect={handleCustomDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </section>
        )}

        {/* Filters */}
        {hasSearched && (
          <section>
            <FilterChips filters={filters} onChange={(f) => setFilters(f)} />
          </section>
        )}

        {/* Results */}
        {hasSearched && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-lg">
                {timeLabels[filters.timeRange]}
              </h2>
              {activities && activities.length > 0 && (
                <span className="text-sm text-muted-foreground font-medium">
                  {activities.length} {activities.length === 1 ? "Ergebnis" : "Ergebnisse"}
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, i) => (
                  <div
                    key={activity.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <ActivityCard
                      activity={activity}
                      isBookmarked={isBookmarked(activity.id)}
                      onToggleBookmark={toggle}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Index;
