import { useState } from "react";
import { Footer } from "@/components/Footer";
import { CalendarIcon, Bookmark, Plus, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Link, useNavigate } from "react-router-dom";
import { QuickActions } from "@/components/QuickActions";
import { KindercafeCarousel } from "@/components/KindercafeCarousel";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import type { SearchFilters } from "@/lib/types";

const Index = () => {
  const navigate = useNavigate();
  const [customDate, setCustomDate] = useState<Date | undefined>();
  const { showAuthDialog, setShowAuthDialog } = useBookmarks();
  const { user, signOut } = useAuth();

  /**
   * IMPORTANT CHANGE:
   * The home page must only act as an entry/navigation page.
   * It must NOT show event results or trigger in-page search rendering.
   *
   * Before:
   * - clicking Jetzt / Heute / Morgen changed local state
   * - the Index page itself became a results page
   *
   * Now:
   * - each quick action navigates to a dedicated route
   *   /jetzt
   *   /heute
   *   /morgen
   */
  const handleQuickAction = (timeRange: SearchFilters["timeRange"]) => {
    if (timeRange === "now") {
      navigate("/jetzt");
      return;
    }

    if (timeRange === "today") {
      navigate("/heute");
      return;
    }

    if (timeRange === "tomorrow") {
      navigate("/morgen");
      return;
    }
  };

  /**
   * IMPORTANT CHANGE:
   * Previously, selecting a date could turn the home page into a results page.
   *
   * Now:
   * - selecting a custom date navigates to a dedicated page/route
   * - the selected date is passed via query parameter
   *
   * Adjust the target route if your app uses a different one.
   * Example alternatives:
   * - /datum?date=...
   * - /kalender?date=...
   * - /aktivitaeten?date=...
   */
  const handleCustomDate = (date: Date | undefined) => {
    setCustomDate(date);

    if (date) {
      const isoDate = format(date, "yyyy-MM-dd");
      navigate(`/datum?date=${isoDate}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 pb-10">
        <header className="px-5 pt-8 pb-2 flex items-center justify-between max-w-3xl mx-auto w-full">
          <Link to="/">
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground flex items-center gap-1.5">
              <span className="text-2xl">🟠</span>
              Rausmi
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
          <section className="pt-6 pb-2 text-center">
            <h2 className="font-display font-bold text-4xl md:text-5xl leading-[1.15] text-foreground tracking-tight">
              Was du <span className="hero-highlight">jetzt</span> mit Kindern in Berlin machen kannst
            </h2>
          </section>

          {/* Quick Actions */}
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

          {/* IMPORTANT REMOVAL:
              We intentionally removed HomeSections from the home page.

              Before:
              {!hasSearched && <HomeSections lat={filters.nearLat} lng={filters.nearLng} />}

              Reason:
              HomeSections was rendering event lists directly on the home page,
              but the intended UX is:
              - Home = entry/navigation only
              - Events should appear only inside dedicated pages like:
                /jetzt
                /heute
                /morgen
                /datum

              Do NOT re-add event result sections to the home page.
          */}

          {/* Kindercafé carousel */}
          <KindercafeCarousel />

          {/* CTA: Sign up to save */}
          {!user && (
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

          {/* CTA: Submit activity */}
          <section
            className="relative rounded-2xl border border-primary/20 bg-card p-5 cursor-pointer group hover:border-primary/40 transition-all"
            onClick={() => navigate("/aktivitaet-einreichen")}
          >
            <div className="absolute left-0 top-3 bottom-3 w-1 rounded-full bg-primary" />
            <div className="flex items-center gap-4 pl-3">
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-primary tracking-wide uppercase">
                  Mitmachen
                </p>
                <h3 className="font-display font-bold text-base text-card-foreground leading-snug mt-1">
                  Neue Aktivität cadastrieren oder Korrektur vorschlagen?
                </h3>
                <p className="text-[13px] text-muted-foreground mt-1">
                  Hilf dem Rausmi zu wachsen und mehr Familien zu erreichen
                </p>
              </div>
              <div className="shrink-0 w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
          </section>

          {/* CTA: Submit event */}
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

          {/* Ad banner: FixMyDiaper */}
          <section>
            <a
              href="https://fixmydiaper.com"
              target="_blank"
              rel="noopener noreferrer"
              className="relative block rounded-2xl border border-border/60 bg-muted/30 p-4 group hover:bg-muted/50 transition-all"
            >
              <p className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-widest mb-2">
                Anzeige
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-sm text-foreground/80 leading-snug">
                    Wickeltisch in der Nähe finden?
                  </h3>
                  <p className="text-[12px] text-muted-foreground mt-0.5">
                    Restaurants, Cafés und öffentliche Orte mit Wickelmöglichkeit in Berlin
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
              </div>
            </a>
          </section>

          {/* Newsletter signup */}
          <NewsletterSignup />

          {/* IMPORTANT REMOVAL:
              We intentionally removed all result-rendering logic from the home page.

              Before, Index.tsx also acted as a search/results page using:
              - hasSearched
              - useQuery(searchActivities)
              - FilterChips
              - LocationFilter
              - results grid with ActivityCard

              That behavior conflicted with the intended UX.

              The correct structure is:
              - Home page = navigation only
              - Dedicated result pages = event rendering
          */}
        </div>

        <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
      </div>

      <Footer />
    </div>
  );
};

export default Index;
