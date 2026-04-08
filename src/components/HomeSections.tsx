import { Clock, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ActivityCard } from "./ActivityCard";
import { fetchJetztActivities, fetchHeuteActivities, fetchMorgenActivities } from "@/lib/activity-queries";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { KindercafeCarousel } from "./KindercafeCarousel";

interface HomeSectionsProps {
  lat?: number;
  lng?: number;
}

export function HomeSections({ lat, lng }: HomeSectionsProps) {
  const { toggle, isBookmarked } = useBookmarks();

  const { data: jetzt, isLoading: loadingJetzt } = useQuery({
    queryKey: ["home-jetzt", lat, lng],
    queryFn: () => fetchJetztActivities(lat, lng),
  });

  const { data: heute, isLoading: loadingHeute } = useQuery({
    queryKey: ["home-heute", lat, lng],
    queryFn: () => fetchHeuteActivities(lat, lng),
  });

  const { data: morgen, isLoading: loadingMorgen } = useQuery({
    queryKey: ["home-morgen", lat, lng],
    queryFn: () => fetchMorgenActivities(lat, lng),
  });

  // Deduplicate: remove from Heute what's already in Jetzt
  const jetztIds = new Set(jetzt?.map((a) => a.id) ?? []);
  const heuteFiltered = heute?.filter((a) => !jetztIds.has(a.id)) ?? [];

  const hasAnyResults = (jetzt?.length ?? 0) > 0 || heuteFiltered.length > 0 || (morgen?.length ?? 0) > 0;
  const isLoading = loadingJetzt || loadingHeute || loadingMorgen;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (!hasAnyResults) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
          <h3 className="font-display font-semibold text-lg mb-2">Gerade nichts gefunden.</h3>
          <div className="text-sm text-muted-foreground max-w-xs space-y-2">
            <p>Versuche es später oder schaue dir diese Alternativen an:</p>
            <ul className="list-none space-y-0.5">
              <li>🏞️ Spielplätze in deiner Nähe</li>
              <li>☕ Kinderfreundliche Cafés</li>
              <li>🏠 Indoor Spielplätze</li>
            </ul>
          </div>
        </div>
        <KindercafeCarousel />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Jetzt */}
      {jetzt && jetzt.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Jetzt</h2>
            <span className="text-sm text-muted-foreground font-medium">
              {jetzt.length} {jetzt.length === 1 ? "Aktivität" : "Aktivitäten"}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jetzt.map((a, i) => (
              <div key={a.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <ActivityCard activity={a} isBookmarked={isBookmarked(a.id)} onToggleBookmark={toggle} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Heute */}
      {heuteFiltered.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Heute</h2>
            <span className="text-sm text-muted-foreground font-medium">
              {heuteFiltered.length} {heuteFiltered.length === 1 ? "Aktivität" : "Aktivitäten"}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heuteFiltered.map((a, i) => (
              <div key={a.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <ActivityCard activity={a} isBookmarked={isBookmarked(a.id)} onToggleBookmark={toggle} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Morgen */}
      {morgen && morgen.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Morgen</h2>
            <span className="text-sm text-muted-foreground font-medium">
              {morgen.length} {morgen.length === 1 ? "Aktivität" : "Aktivitäten"}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {morgen.map((a, i) => (
              <div key={a.id} className="animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
                <ActivityCard activity={a} isBookmarked={isBookmarked(a.id)} onToggleBookmark={toggle} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
