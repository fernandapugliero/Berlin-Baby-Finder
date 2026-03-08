import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { EventCard } from "@/components/EventCard";
import { fetchCrawledEvents, filterEvents } from "@/lib/json-events";
import type { TimeFilter, AgeFilter } from "@/lib/json-events";

const TIME_FILTERS: { key: TimeFilter; label: string }[] = [
  { key: "jetzt", label: "Jetzt" },
  { key: "nachmittag", label: "Heute Nachmittag" },
  { key: "morgen", label: "Morgen" },
];

const AGE_FILTERS: { key: AgeFilter; label: string }[] = [
  { key: "0-1", label: "0–1 Jahre" },
  { key: "1-3", label: "1–3 Jahre" },
  { key: "3-6", label: "3–6 Jahre" },
];

const Index = () => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter | null>(null);
  const [ageFilter, setAgeFilter] = useState<AgeFilter | null>(null);

  const { data: allEvents = [], isLoading } = useQuery({
    queryKey: ["crawled-events"],
    queryFn: fetchCrawledEvents,
    staleTime: 1000 * 60 * 10,
  });

  const filtered = useMemo(
    () => filterEvents(allEvents, timeFilter, ageFilter),
    [allEvents, timeFilter, ageFilter]
  );

  const toggleTime = (key: TimeFilter) =>
    setTimeFilter((prev) => (prev === key ? null : key));

  const toggleAge = (key: AgeFilter) =>
    setAgeFilter((prev) => (prev === key ? null : key));

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="px-5 pt-8 pb-1 max-w-2xl mx-auto">
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          🟠 Rausi
        </h1>
      </header>

      <div className="px-5 space-y-6 max-w-2xl mx-auto">
        {/* Hero */}
        <section className="pt-4 pb-2">
          <h2 className="font-display font-bold text-3xl md:text-4xl leading-[1.15] text-foreground tracking-tight">
            Was machen mit{" "}
            <span className="hero-highlight">Kindern</span>{" "}
            in Berlin?
          </h2>
          <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-md">
            Finde Aktivitäten in deinem Kiez – genau dann, wenn du raus willst.
          </p>
        </section>

        {/* Filter chips */}
        <section className="space-y-3">
          {/* Time filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-5 px-5">
            {TIME_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                className={`filter-chip ${timeFilter === key ? "active" : ""}`}
                onClick={() => toggleTime(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Age filters */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-5 px-5">
            {AGE_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                className={`filter-chip ${ageFilter === key ? "active" : ""}`}
                onClick={() => toggleAge(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* Results */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-lg text-foreground">
              {timeFilter === "jetzt"
                ? "Jetzt verfügbar"
                : timeFilter === "nachmittag"
                ? "Heute Nachmittag"
                : timeFilter === "morgen"
                ? "Morgen"
                : "Alle Aktivitäten"}
            </h3>
            {!isLoading && (
              <span className="text-sm text-muted-foreground font-medium">
                {filtered.length}{" "}
                {filtered.length === 1 ? "Ergebnis" : "Ergebnisse"}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-40 rounded-2xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((event, i) => (
                <div
                  key={event.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🙈</p>
              <p className="font-display font-semibold text-lg text-foreground">
                Keine Aktivitäten gefunden
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Probiere einen anderen Filter!
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Index;
