import { Clock, MapPin, Baby } from "lucide-react";
import type { CrawledEvent } from "@/lib/json-events";

interface EventCardProps {
  event: CrawledEvent;
}

export function EventCard({ event }: EventCardProps) {
  const ageLabel = event.age;

  return (
    <a
      href={event.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="card-activity block cursor-pointer group"
    >
      {/* Color accent bar */}
      <div className="h-1.5 bg-primary/40" />

      <div className="p-5 space-y-3">
        {/* Title */}
        <h3 className="font-display font-bold text-base leading-snug text-card-foreground group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        {/* Time */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 shrink-0 text-primary" />
          <span className="font-medium">
            {event.start_time}
            {event.end_time ? ` – ${event.end_time}` : ""}
          </span>
        </div>

        {/* Venue */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0 text-primary" />
          <span className="truncate">{event.venue_name}</span>
        </div>

        {/* Age + tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {ageLabel && (
            <span className="chip chip-age flex items-center gap-1">
              <Baby className="w-3 h-3" />
              {ageLabel}
            </span>
          )}
          <span className="chip chip-district">{event.source_name}</span>
        </div>
      </div>
    </a>
  );
}
