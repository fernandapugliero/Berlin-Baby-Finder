import { useState, useMemo } from "react";
import { Footer } from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { CalendarIcon, Bookmark, Plus } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { QuickActions } from "@/components/QuickActions";
import { FilterChips } from "@/components/FilterChips";
import { ActivityCard } from "@/components/ActivityCard";
import { EmptyState } from "@/components/EmptyState";
import { LocationFilter } from "@/components/LocationFilter";
import { DistrictFilter } from "@/components/DistrictFilter";
import { HomepagePreview } from "@/components/HomepagePreview";
import { KindercafeCarousel } from "@/components/KindercafeCarousel";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { searchActivities } from "@/lib/activity-queries";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import type { SearchFilters } from "@/lib/types";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialTimeRange = (searchParams.get("t") as SearchFilters["timeRange"]) || "now";
  const initialSearched = searchParams.has("t");
  const initialCustomDate = searchParams.get("cd") ? new Date(searchParams.get("cd")!) : undefined;

  const [filters, setFilters] = useState<SearchFilters>(() => ({
    timeRange: initialTimeRange,
    customDate: initialCustomDate,
  }));
  const [hasSearched, setHasSearched] = useState(initialSearched);
  const [customDate, setCustomDate] = useState<Date | undefined>(initialCustomDate);
  const [isLocating, setIsLocating] = useState(false);
  const [activeLocation, setActiveLocation] = useState<string>();
  const [selectedDistrict, setSelectedDistrict] = useState<string | undefined>();
  const { toggle, isBookmarked, showAuthDialog, setShowAuthDialog } = useBookmarks();
  const { user, signOut } = useAuth();

  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities", filters],
    queryFn: () => searchActivities(filters),
    enabled: hasSearched,
  });

  const handleQuickAction = (timeRange: SearchFilters["timeRange"]) => {
    setFilters((f) => ({ ...f, timeRange }));
    setHasSearched(true);
    setSearchParams({ t: timeRange }, { replace: true });
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
      setSearchParams({ t: "custom", cd: date.toISOString() }, { replace: true });
    }
  };

  const handleDistrictChange = (district: string | undefined) => {
    setSelectedDistrict(district);
    if (district) {
      setFilters((f) => ({ ...f, district: district as any }));
    } else {
      setFilters((f) => {
        const { district: _, ...rest } = f;
        return rest as SearchFilters;
      });
    }
  };

  const timeLabels: Record<string, string> = {
    now: "Jetzt verfügbar",
    today: "Heute",
    tomorrow: "Morgen",
    custom: customDate ? format(customDate, "EEEE, dd. MMMM", { locale: de }) : "Ergebnisse",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 pb-10">
          <header className="px-5 pt-8 pb-2 flex items-center justify-between max-w-3xl mx-auto w-full">
          <Link to="/" onClick={() => { setHasSearched(false); setFilters({ timeRange: "now" }); setSearchParams({}, { replace: true }); }}>
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
              <span className="text-2xl">🟠</span>
              Rausi
            </h1>
          </Link>
          {user ? (
            <button
              onClick={signOut}
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              Abmelden
            </button>
          ) : (
            <button
              onClick={() => setShowAuthDialog(true)}
              className="text-sm text-primary font-semibold hover:underline transition-colors"
            >
              Anmelden
            </button>
          )}
        </header>

        <div className="px-5 space-y-8 max-w-3xl mx-auto">
          {/* Hero */}
          {!hasSearched && (
            <section className="pt-6 pb-2 text-center">
              <h2 className="font-display font-bold text-4xl md:text-5xl leading-[1.15] text-foreground tracking-tight">
                Was du <span className="hero-highlight">jetzt</span> mit Kindern in Berlin machen kannst.
              </h2>
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
                          Datum auswählen
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

          {/* Preview card on homepage */}
          {!hasSearched && <HomepagePreview />}

          {/* Kindercafé carousel */}
          {!hasSearched && <KindercafeCarousel />}

          {/* CTA: Sign up to save */}
          {!hasSearched && !user && (
            <section
              className="relative rounded-2xl border border-primary/20 bg-card p-5 cursor-pointer group hover:border-primary/40 transition-all"
              onClick={() => setShowAuthDialog(true)}
            >
              <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-primary" />
              <div className="flex items-center gap-4 pl-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-primary tracking-wide uppercase">
                    Nie wieder verpassen
                  </p>
                  <h3 className="font-display font-bold text-base text-card-foreground leading-snug mt-1">
                    Speichere Aktivitäten und erhalte Erinnerungen.
                  </h3>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    Kostenlos · Kein Spam
                  </p>
                </div>
                <div className="shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bookmark className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            </section>
          )}

          {/* CTA: Submit event */}
          {!hasSearched && (
            <section
              className="relative rounded-2xl border border-accent/30 bg-card p-5 cursor-pointer group hover:border-accent/50 transition-all"
              onClick={() => navigate("/event-einreichen")}
            >
              <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-accent" />
              <div className="flex items-center gap-4 pl-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-accent tracking-wide uppercase">
                    Community
                  </p>
                  <h3 className="font-display font-bold text-base text-card-foreground leading-snug mt-1">
                    Kennst du ein tolles Event? Reiche es ein!
                  </h3>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    Wir prüfen und veröffentlichen es
                  </p>
                </div>
                <div className="shrink-0 w-10 h-10 rounded-xl bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-accent-foreground" />
                </div>
              </div>
            </section>
          )}

          {/* Newsletter signup */}
          {!hasSearched && <NewsletterSignup />}

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
              {(["now", "today", "tomorrow"] as const).map((key) => (
                <button
                  key={key}
                  className={`filter-chip ${filters.timeRange === key ? "active" : ""}`}
                  onClick={() => handleQuickAction(key)}
                >
                  {({ now: "Jetzt", today: "Heute", tomorrow: "Morgen" } as const)[key]}
                </button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <button className={`filter-chip ${filters.timeRange === "custom" ? "active" : ""}`}>
                    {customDate ? format(customDate, "dd. MMM", { locale: de }) : "Datum"}
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

          {/* Location */}
          {hasSearched && (
            <section>
              <LocationFilter
                onNearMe={handleNearMe}
                onSearchLocation={handleSearchLocation}
                isLocating={isLocating}
                activeLocation={activeLocation}
              />
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
              {activities && activities.length > 0 && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-bold text-lg">
                    {timeLabels[filters.timeRange]}
                  </h2>
                  <span className="text-sm text-muted-foreground font-medium">
                    {activities.length} {activities.length === 1 ? "Ergebnis" : "Ergebnisse"}
                  </span>
                </div>
              )}

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : activities && activities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
