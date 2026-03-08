import { useEffect } from "react";
import { Zap, Sun, Sunrise } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchActivities } from "@/lib/activity-queries";
import type { SearchFilters } from "@/lib/types";

interface QuickActionsProps {
  onSelect: (timeRange: SearchFilters["timeRange"]) => void;
}

export function QuickActions({ onSelect }: QuickActionsProps) {
  // Prefetch "now" count
  const { data: nowActivities } = useQuery({
    queryKey: ["activities", { timeRange: "now" }],
    queryFn: () => searchActivities({ timeRange: "now" }),
  });

  const nowCount = nowActivities?.length ?? null;

  const actions = [
    {
      key: "now" as const,
      label: "Jetzt",
      sublabel: nowCount !== null
        ? `${nowCount} Aktivität${nowCount === 1 ? "" : "en"} in den nächsten 3 Stunden`
        : "Aktivitäten in den nächsten 3 Stunden",
      icon: Zap,
      gradient: "from-primary to-primary/80",
      textColor: "text-primary-foreground",
    },
    {
      key: "today" as const,
      label: "Heute",
      sublabel: "Alle Aktivitäten heute",
      icon: Sun,
      gradient: "from-secondary to-secondary/80",
      textColor: "text-secondary-foreground",
    },
    {
      key: "tomorrow" as const,
      label: "Morgen",
      sublabel: "Alle Aktivitäten morgen",
      icon: Sunrise,
      gradient: "from-accent to-accent/80",
      textColor: "text-accent-foreground",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {actions.map((action) => (
        <button
          key={action.key}
          className={`w-full flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r ${action.gradient} ${action.textColor} transition-all duration-200 active:scale-[0.97] hover:scale-[1.02]`}
          style={{ boxShadow: "var(--shadow-hero)" }}
          onClick={() => onSelect(action.key)}
        >
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <action.icon className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="font-display font-bold text-lg block leading-tight">
              {action.label}
            </span>
            <span className="text-sm opacity-90">{action.sublabel}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
