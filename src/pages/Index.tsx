import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QuickActions } from "@/components/QuickActions";
import { FilterChips } from "@/components/FilterChips";
import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState } from "@/components/EmptyState";
import { searchActivities } from "@/lib/activity-queries";
import type { SearchFilters } from "@/lib/types";

const Index = () => {
  const [filters, setFilters] = useState<SearchFilters>({ timeRange: "now" });
  const [hasSearched, setHasSearched] = useState(false);

  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities", filters],
    queryFn: () => searchActivities(filters),
    enabled: hasSearched,
  });

  const handleQuickAction = (timeRange: SearchFilters["timeRange"]) => {
    setFilters((f) => ({ ...f, timeRange }));
    setHasSearched(true);
  };

  const timeLabels: Record<string, string> = {
    now: "Jetzt verfügbar",
    today_afternoon: "Heute Nachmittag",
    tomorrow_morning: "Morgen Vormittag",
    custom: "Ergebnisse",
  };

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <header className="px-5 pt-10 pb-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Rausi
        </h1>
      </header>

      <div className="px-5 space-y-8">
        {/* Hero */}
        <section>
          <h2 className="font-display font-bold text-2xl leading-snug text-foreground">
            Was machen mit Kindern in Berlin?
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Finde Aktivitäten in deinem Kiez – genau dann, wenn du raus willst.
          </p>
        </section>

        {/* Quick Actions */}
        {!hasSearched && (
          <section>
            <QuickActions onSelect={handleQuickAction} />
          </section>
        )}

        {/* Filters (always visible once searched) */}
        {hasSearched && (
          <section>
            <FilterChips
              filters={filters}
              onChange={(f) => setFilters(f)}
            />
          </section>
        )}

        {/* Quick actions as small row when searched */}
        {hasSearched && (
          <section className="flex gap-2 overflow-x-auto -mx-5 px-5 scrollbar-hide pb-1">
            {(["now", "today_afternoon", "tomorrow_morning"] as const).map((key) => (
              <button
                key={key}
                className={`filter-chip ${filters.timeRange === key ? "active" : ""}`}
                onClick={() => handleQuickAction(key)}
              >
                {({ now: "Jetzt", today_afternoon: "Heute PM", tomorrow_morning: "Morgen VM" } as const)[key]}
              </button>
            ))}
          </section>
        )}

        {/* Results */}
        {hasSearched && (
          <section>
            <h2 className="font-display font-semibold text-lg mb-4">
              {timeLabels[filters.timeRange]}
            </h2>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl bg-muted animate-pulse"
                  />
                ))}
              </div>
            ) : activities && activities.length > 0 ? (
              <div className="space-y-4">
                {activities.map((activity, i) => (
                  <div
                    key={activity.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <ActivityCard activity={activity} />
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
