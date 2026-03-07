import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, MapPin, ExternalLink, Baby, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatActivityTime, getRelativeTimeLabel, getAgeLabel, getCategoryIcon } from "@/lib/utils";

const ActivityDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: activity, isLoading } = useQuery({
    queryKey: ["activity", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
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
  const categoryIcon = getCategoryIcon(activity.category);

  return (
    <div className="min-h-screen pb-10">
      {/* Top bar */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full -ml-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="font-display font-semibold text-sm text-muted-foreground">Rausi</span>
      </header>

      <div className="px-5 space-y-6">
        {/* Image */}
        {activity.image_url && (
          <div className="rounded-2xl overflow-hidden">
            <img
              src={activity.image_url}
              alt={activity.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Status badge */}
        {statusLabel && (
          <span className={statusType === "live" ? "chip chip-live" : "chip chip-soon"}>
            {statusType === "live" ? "🟢 " : "⏳ "}{statusLabel}
          </span>
        )}

        {/* Title */}
        <h1 className="font-display font-bold text-2xl leading-tight text-foreground">
          {categoryIcon && <span className="mr-2">{categoryIcon}</span>}
          {activity.title}
        </h1>

        {/* Description */}
        {activity.description && (
          <p className="text-base text-muted-foreground leading-relaxed">
            {activity.description}
          </p>
        )}

        {/* Info rows */}
        <div className="space-y-4 bg-card rounded-2xl p-5" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary/70 shrink-0" />
            <span className="text-sm">{formatActivityTime(startTime, endTime)}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary/70 shrink-0" />
            <div>
              <span className="text-sm block">{activity.location_name}</span>
              {activity.address && (
                <span className="text-xs text-muted-foreground">{activity.address}</span>
              )}
            </div>
          </div>
          {activity.age_groups.length > 0 && (
            <div className="flex items-center gap-3">
              <Baby className="w-5 h-5 text-primary/70 shrink-0" />
              <span className="text-sm">{activity.age_groups.map(getAgeLabel).join(", ")}</span>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Tag className="w-5 h-5 text-primary/70 shrink-0" />
            <span className="text-sm">
              {activity.is_free ? "Kostenlos" : activity.price_info || "Kostenpflichtig"}
            </span>
          </div>
        </div>

        {/* Registration info */}
        {activity.registration_required && (
          <div className="bg-accent/10 rounded-2xl p-4">
            <p className="text-sm font-medium text-accent-foreground">
              Anmeldung erforderlich
            </p>
            {activity.registration_url && (
              <a
                href={activity.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary underline mt-1 inline-block"
              >
                Zur Anmeldung →
              </a>
            )}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="chip chip-district">{activity.district}</span>
          {activity.age_groups.map((age) => (
            <span key={age} className="chip chip-age">{getAgeLabel(age)}</span>
          ))}
        </div>

        {/* Source link */}
        {activity.source_url && (
          <a
            href={activity.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Originalquelle ansehen
          </a>
        )}
      </div>
    </div>
  );
};

export default ActivityDetail;
