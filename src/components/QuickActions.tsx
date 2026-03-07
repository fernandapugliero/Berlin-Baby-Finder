import { Zap, Sun, Sunrise } from "lucide-react";
import type { SearchFilters } from "@/lib/types";

interface QuickActionsProps {
  onSelect: (timeRange: SearchFilters["timeRange"]) => void;
}

export function QuickActions({ onSelect }: QuickActionsProps) {
  const actions = [
    {
      key: "now" as const,
      label: "Jetzt",
      sublabel: "Aktivitäten in den nächsten 3 Stunden",
      icon: Zap,
      iconColor: "text-primary",
    },
    {
      key: "today_afternoon" as const,
      label: "Heute Nachmittag",
      sublabel: "12:00 – 18:00",
      icon: Sun,
      iconColor: "text-accent-foreground",
    },
    {
      key: "tomorrow_morning" as const,
      label: "Morgen Vormittag",
      sublabel: "08:00 – 13:00",
      icon: Sunrise,
      iconColor: "text-secondary-foreground",
    },
  ];

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <button
          key={action.key}
          className="quick-action-btn w-full"
          onClick={() => onSelect(action.key)}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <action.icon className={`w-5 h-5 ${action.iconColor}`} />
            </div>
            <div className="text-left">
              <span className="font-display font-semibold text-base text-card-foreground block">
                {action.label}
              </span>
              <span className="text-sm text-muted-foreground">{action.sublabel}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
