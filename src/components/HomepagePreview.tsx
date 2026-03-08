import { Clock, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchActivities } from "@/lib/activity-queries";
import { formatActivityTime } from "@/lib/utils";

export function HomepagePreview() {
  const { data: activities } = useQuery({
    queryKey: ["activities", { timeRange: "now" }],
    queryFn: () => searchActivities({ timeRange: "now" }),
  });

  const preview = activities?.[0];
  if (!preview) return null;

  const startTime = new Date(preview.start_time);
  const endTime = preview.end_time ? new Date(preview.end_time) : null;

  return (
    <section className="space-y-3">
      <h3 className="font-display font-semibold text-base text-muted-foreground">
        Heute in deiner Nähe
      </h3>
      <div
        className="card-activity pointer-events-none"
      >
        <div className="h-1.5 bg-secondary" />
        <div className="p-5 space-y-2">
          <span className="chip chip-live">Läuft bald</span>
          <h4 className="font-display font-bold text-lg leading-tight text-card-foreground">
            {preview.title}
          </h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 shrink-0 text-primary" />
            <span className="font-medium">{formatActivityTime(startTime, endTime)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 shrink-0 text-primary" />
            <span>{preview.location_name}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
