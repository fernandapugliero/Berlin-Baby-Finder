import { Zap, Sun, Sunrise } from "lucide-react";
import type { SearchFilters } from "@/lib/types";

interface QuickActionsProps {
  onSelect: (timeRange: SearchFilters["timeRange"]) => void;
}

export function QuickActions({ onSelect }: QuickActionsProps) {
  const actions = [
    {
      key: "now" as const,
      label: "Now",
      sublabel: "Next 3 hours",
      icon: Zap,
      iconColor: "text-accent",
    },
    {
      key: "today_afternoon" as const,
      label: "Today PM",
      sublabel: "12:00–18:00",
      icon: Sun,
      iconColor: "text-primary",
    },
    {
      key: "tomorrow_morning" as const,
      label: "Tomorrow AM",
      sublabel: "08:00–13:00",
      icon: Sunrise,
      iconColor: "text-secondary-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action) => (
        <button
          key={action.key}
          className="quick-action-btn"
          onClick={() => onSelect(action.key)}
        >
          <action.icon className={`w-6 h-6 ${action.iconColor}`} />
          <span className="font-display font-semibold text-sm text-card-foreground">
            {action.label}
          </span>
          <span className="text-[11px] text-muted-foreground">{action.sublabel}</span>
        </button>
      ))}
    </div>
  );
}
