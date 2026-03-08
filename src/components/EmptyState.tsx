import { KindercafeCarousel } from "./KindercafeCarousel";

interface EmptyStateProps {
  title?: string;
  description?: string;
  showSuggestions?: boolean;
}

export function EmptyState({
  title = "Gerade nichts gefunden.",
  description,
  showSuggestions = true,
}: EmptyStateProps) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
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

      {showSuggestions && (
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
            Stattdessen entdecken
          </p>
          <KindercafeCarousel />
        </div>
      )}
    </div>
  );
}
