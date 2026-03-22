import { MapPin, Clock, Bookmark, Navigation, Repeat, Share2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Activity } from "@/lib/types";
import type { AirtableActivity } from "@/lib/airtable";
import { getRelativeTimeLabel, formatActivityTime, getAgeLabel, getCategoryIcon, getRecurringDayLabel } from "@/lib/utils";
import { formatDistance } from "@/lib/activity-queries";
import { toast } from "sonner";

interface ActivityCardProps {
  activity: (Activity | AirtableActivity) & { _distance?: number | null; _ageLabel?: string | null; _sponsored?: boolean; _recurrenceType?: string | null; _dayOfWeek?: string | null };
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
}

export function ActivityCard({ activity, isBookmarked, onToggleBookmark }: ActivityCardProps) {
  const navigate = useNavigate();
  const startTime = new Date(activity.start_time);
  const endTime = activity.end_time ? new Date(activity.end_time) : null;
  const { label: statusLabel, type: statusType } = getRelativeTimeLabel(startTime, endTime);

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark?.(activity.id);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const baseUrl = window.location.origin || window.location.protocol + '//' + window.location.host;
    const url = `${baseUrl}/activity/${activity.id}`;
    const text = `${activity.title} – ${activity.location_name}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: activity.title, text, url });
        return;
      }
    } catch {
      // share cancelled or failed, fall through
    }

    // Fallback: copy to clipboard (URL only)
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link kopiert!");
    } catch {
      // Last fallback: WhatsApp
      const waUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
      window.open(waUrl, "_blank");
    }
  };

  return (
    <div
      className="card-activity cursor-pointer group"
      onClick={() => navigate(`/activity/${activity.id}`)}
      role="button"
      tabIndex={0}
    >
      {/* Color accent bar */}
      <div className={`h-1.5 ${statusType === "live" ? "bg-secondary" : statusType === "soon" ? "bg-accent" : "bg-primary/30"}`} />
      
      <div className="p-5 space-y-3">
        {/* Top row: status + actions */}
        <div className="flex items-center justify-between">
          <div>
            {statusLabel && (
              <span className={statusType === "live" ? "chip chip-live" : "chip chip-soon"}>
                {statusLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1.5 bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
              aria-label="Teilen"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            {onToggleBookmark && (
              <button
                onClick={handleBookmark}
                className={`flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1.5 transition-all ${
                  isBookmarked
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
                aria-label={isBookmarked ? "Gespeichert" : "Merken"}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-current" : ""}`} />
                {isBookmarked ? "Gemerkt" : "Merken"}
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-lg leading-tight text-card-foreground group-hover:text-primary transition-colors">
          {activity.title}
        </h3>

        {/* Description */}
        {activity.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {activity.description}
          </p>
        )}

        {/* Time + recurring */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 shrink-0 text-primary" />
          <span className="font-medium">{formatActivityTime(startTime, endTime)}</span>
        </div>
        {activity.recurring && activity.recurrence_rule && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Repeat className="w-4 h-4 shrink-0 text-accent" />
            <span className="font-medium">{getRecurringDayLabel(activity.recurrence_rule)}</span>
          </div>
        )}

        {/* Location + distance */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0 text-primary" />
          <span className="truncate">{activity.location_name}</span>
          {activity._distance != null && (
            <span className="flex items-center gap-1 shrink-0 text-secondary font-semibold">
              <Navigation className="w-3.5 h-3.5" />
              {formatDistance(activity._distance)}
            </span>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className={activity.is_free ? "chip chip-free" : "chip chip-paid"}>
            {activity.is_free ? "Kostenlos" : activity.price_info || "Kostenpflichtig"}
          </span>
          <span className="chip chip-district">{activity.district}</span>
          {activity.age_groups.map((age) => (
            <span key={age} className="chip chip-age">
              {getAgeLabel(age)}
            </span>
          ))}
          {activity.registration_required && (
            <span className="chip bg-destructive/15 text-destructive font-bold">
              Anmeldung nötig
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
