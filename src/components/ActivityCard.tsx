import { MapPin, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Activity } from "@/lib/types";
import { getRelativeTimeLabel, formatActivityTime, getAgeLabel, getCategoryIcon } from "@/lib/utils";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const navigate = useNavigate();
  const startTime = new Date(activity.start_time);
  const endTime = activity.end_time ? new Date(activity.end_time) : null;
  const { label: statusLabel, type: statusType } = getRelativeTimeLabel(startTime, endTime);
  const categoryIcon = getCategoryIcon(activity.category);

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
        {/* Status badge */}
        {statusLabel && (
          <span className={statusType === "live" ? "chip chip-live" : "chip chip-soon"}>
            {statusType === "live" ? "🟢 " : "⏳ "}{statusLabel}
          </span>
        )}

        {/* Title */}
        <h3 className="font-display font-bold text-lg leading-tight text-card-foreground group-hover:text-primary transition-colors">
          {categoryIcon && <span className="mr-1.5">{categoryIcon}</span>}
          {activity.title}
        </h3>

        {/* Description */}
        {activity.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {activity.description}
          </p>
        )}

        {/* Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 shrink-0 text-primary" />
          <span className="font-medium">{formatActivityTime(startTime, endTime)}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0 text-primary" />
          <span className="truncate">{activity.location_name}</span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className={activity.is_free ? "chip chip-free" : "chip chip-paid"}>
            {activity.is_free ? "✓ Kostenlos" : activity.price_info || "Kostenpflichtig"}
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
