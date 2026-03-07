import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickActions } from "@/components/QuickActions";
import { SearchFiltersPanel } from "@/components/SearchFilters";
import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState } from "@/components/EmptyState";
import { searchActivities } from "@/lib/activity-queries";
import type { SearchFilters } from "@/lib/types";

const Index = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<SearchFilters>({ timeRange: "now" });
  const [filtersOpen, setFiltersOpen] = useState(false);
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
    now: "Happening now",
    today_afternoon: "Today afternoon",
    tomorrow_morning: "Tomorrow morning",
    custom: "Custom date",
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            BabyBerlin
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Find baby-friendly activities near you
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate("/admin")}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </header>

      <div className="px-4 space-y-6">
        {/* Quick Actions */}
        <section>
          <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
            Quick search
          </h2>
          <QuickActions onSelect={handleQuickAction} />
        </section>

        {/* Filters */}
        <section className="flex items-start gap-2">
          <SearchFiltersPanel
            filters={filters}
            onChange={(f) => {
              setFilters(f);
              if (hasSearched) setHasSearched(true);
            }}
            open={filtersOpen}
            onToggle={() => setFiltersOpen(!filtersOpen)}
          />
          {!hasSearched && (
            <Button
              size="sm"
              className="rounded-full gap-2"
              onClick={() => setHasSearched(true)}
            >
              <Search className="w-4 h-4" />
              Search
            </Button>
          )}
        </section>

        {/* Results */}
        {hasSearched && (
          <section>
            <h2 className="font-display font-semibold text-lg mb-3">
              {timeLabels[filters.timeRange]}
            </h2>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 rounded-2xl bg-muted animate-pulse"
                  />
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
                    <ActivityCard activity={activity} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No activities found"
                description="Try a different time window or adjust your filters to find something fun!"
              />
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default Index;
