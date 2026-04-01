import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, MapPin, ExternalLink, Baby, Tag, Bookmark, Repeat, Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAllActivities } from "@/lib/activity-queries";
import { formatActivityTime, getRelativeTimeLabel, getAgeLabel, getRecurringDayLabel } from "@/lib/utils";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { AuthDialog } from "@/components/AuthDialog";

const ActivityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toggle, isBookmarked, showAuthDialog, setShowAuthDialog } = useBookmarks();

  const { data: activity, isLoading } = useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      const all = await fetchAllActivities();
      return all.find((a) => a.id === id) ?? null;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen px-5 pt-6">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 rounded-xl bg-muted animate-pulse" />
          <div className="h-4 w-full rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-2/3 rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <h2 className="font-display font-semibold text-lg mb-2">Aktivität nicht gefunden</h2>
          <Button variant="outline" className="rounded-full" onClick={() => navigate("/")}>
            Zurück
          </Button>
        </div>
      </div>
    );
  }

  const startTime = new Date(activity.start_time);
  const endTime = activity.end_time ? new Date(activity.end_time) : null;
  const { label: statusLabel, type: statusType } = getRelativeTimeLabel(startTime, endTime);
  const bookmarked = isBookmarked(activity.id);

  const ageDisplay = activity._ageLabel
    || (activity.age_groups.length > 0
      ? activity.age_groups.map(getAgeLabel).join(", ")
      : null);

  return (
    <div className="min-h-screen pb-10">
      {/* Top bar */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-full -ml-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Link to="/" className="font-display font-semibold text-sm text-muted-foreground hover:text-primary transition-colors">
            🟠 Rausmi
          </Link>
        </div>
        <button
          onClick={() => toggle(activity.id)}
          className={`flex items-center gap-1.5 text-sm font-semibold rounded-full px-3 py-2 transition-all ${
            bookmarked
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
          }`}
        >
          <Bookmark className={`w-4 h-4 ${bookmarked ? "fill-current" : ""}`} />
          {bookmarked ? "Gemerkt" : "Merken"}
        </button>
      </header>

      <div className="px-5 space-y-6 max-w-3xl mx-auto">
        {/* Status + Sponsored badges */}
        <div className="flex flex-wrap gap-2">
          {statusLabel && (
            <span className={statusType === "live" ? "chip chip-live" : "chip chip-soon"}>
              {statusLabel}
            </span>
          )}
          {activity._sponsored && (
            <span className="chip bg-accent/15 text-accent font-bold flex items-center gap-1">
              <Star className="w-3 h-3" />
              Sponsored
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="font-display font-bold text-2xl leading-tight text-foreground">
          {activity.title}
        </h1>

        {/* Description */}
        {activity.description && (
          <p className="text-base text-muted-foreground leading-relaxed">
            {activity.description}
          </p>
        )}

        {/* Info card */}
        <div className="space-y-4 bg-card rounded-2xl p-5 border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
          {/* Time */}
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm font-medium">{formatActivityTime(startTime, endTime)}</span>
          </div>

          {/* Recurrence */}
          {activity.recurring && activity._dayOfWeek && (
            <div className="flex items-center gap-3">
              <Repeat className="w-5 h-5 text-accent shrink-0" />
              <span className="text-sm font-medium">
                {getRecurringDayLabel(activity._dayOfWeek)}
                {activity._recurrenceType === "monthly" ? " (monatlich)" : ""}
              </span>
            </div>
          )}

          {/* Venue + Address */}
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary shrink-0" />
            <div>
              <span className="text-sm block font-medium">{activity.location_name}</span>
              {activity.address && (
                <span className="text-xs text-muted-foreground">{activity.address}</span>
              )}
            </div>
          </div>

          {/* District */}
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-muted-foreground/50 shrink-0" />
            <span className="text-sm text-muted-foreground">{activity.district}</span>
          </div>

          {/* Age */}
          {ageDisplay && (
            <div className="flex items-center gap-3">
              <Baby className="w-5 h-5 text-primary shrink-0" />
              <span className="text-sm">{ageDisplay}</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm">
              {activity.is_free ? "Kostenlos" : activity.price_info || "Kostenpflichtig"}
            </span>
          </div>

          {/* Registration */}
          {activity.registration_required && (
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-destructive shrink-0" />
              <span className="text-sm font-medium text-destructive">Anmeldung erforderlich</span>
            </div>
          )}
        </div>

        {/* Registration link */}
        {activity._registrationLink && (
          <a
            href={activity._registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Zur Anmeldung
          </a>
        )}

        {/* Source link */}
        {activity.source_url && (
          <a
            href={activity.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Originalquelle ansehen
          </a>
        )}

        {/* Verified metadata */}
        {activity._verifiedAt && (
          <p className="text-xs text-muted-foreground/60">
            Verifiziert am {new Date(activity._verifiedAt).toLocaleDateString("de-DE")}
          </p>
        )}
      </div>
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
};

export default ActivityDetail;
