import { CloudOff } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "Gerade nichts gefunden.",
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-5">
        <CloudOff className="w-7 h-7 text-muted-foreground" />
      </div>
      <h3 className="font-display font-semibold text-lg mb-2">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground max-w-xs">{description}</p>
      ) : (
        <div className="text-sm text-muted-foreground max-w-xs space-y-1">
          <p>Versuche:</p>
          <ul className="list-none space-y-0.5">
            <li>• später heute</li>
            <li>• einen anderen Bezirk</li>
            <li>• morgen</li>
          </ul>
        </div>
      )}
    </div>
  );
}
