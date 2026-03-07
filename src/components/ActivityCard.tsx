import { format } from "date-fns";
import { MapPin, Clock, Baby, ExternalLink } from "lucide-react";
import type { Activity } from "@/lib/types";

interface ActivityCardProps {
  activity: Activity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const startTime = new Date(activity.start_time);
  const endTime = activity.end_time ? new Date(activity.end_time) : null;

  return (
    <div className="card-activity">
      {activity.image_url && (
        <div className="h-36 overflow-hidden">
          <img
            src={activity.image_url}
            alt={activity.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-base leading-tight text-card-foreground">
            {activity.title}
          </h3>
          {activity.registration_url && (
            <a
              href={activity.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-primary hover:text-primary/80"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {activity.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {activity.description}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>
            {format(startTime, "HH:mm")}
            {endTime && ` – ${format(endTime, "HH:mm")}`}
            {" · "}
            {format(startTime, "EEE, dd MMM")}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{activity.location_name}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className={activity.is_free ? "chip chip-free" : "chip chip-paid"}>
            {activity.is_free ? "Free" : activity.price_info || "Paid"}
          </span>
          <span className="chip chip-district">{activity.district}</span>
          {activity.age_groups.map((age) => (
            <span key={age} className="chip chip-age">
              <Baby className="w-3 h-3 mr-1" />
              {age}
            </span>
          ))}
          {activity.registration_required && (
            <span className="chip bg-destructive/10 text-destructive">
              Registration
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
