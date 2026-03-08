import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Coffee, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import kindercafePlaceholder from "@/assets/kindercafe-placeholder.jpg";

interface Kindercafe {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  district: string;
  image_url: string | null;
  features: string[];
  is_sponsored: boolean;
  google_maps_url: string | null;
}

export function KindercafeCarousel() {
  const navigate = useNavigate();

  const { data: cafes, isLoading } = useQuery({
    queryKey: ["kindercafes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kindercafes")
        .select("*")
        .eq("is_approved", true)
        .order("is_sponsored", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Kindercafe[];
    },
  });

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h2 className="font-display font-bold text-lg text-foreground">
          ☕ Kindercafés & Spielecken
        </h2>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-5 px-5">
          {[1, 2].map((i) => (
            <div key={i} className="w-64 shrink-0 h-56 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  if (!cafes || cafes.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-bold text-lg text-foreground">
          ☕ Kindercafés & Spielecken
        </h2>
        <button
          onClick={() => navigate("/kindercafe-einreichen")}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
        >
          Café eintragen
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-2">
        {cafes.map((cafe) => (
          <div
            key={cafe.id}
            className="w-64 shrink-0 rounded-2xl overflow-hidden border border-border bg-card cursor-pointer group transition-all hover:shadow-md"
            style={{ boxShadow: "var(--shadow-card)" }}
            onClick={() => {
              if (cafe.google_maps_url) {
                window.open(cafe.google_maps_url, "_blank");
              }
            }}
          >
            {/* Image */}
            <div className="relative h-36 overflow-hidden">
              <img
                src={cafe.image_url || kindercafePlaceholder}
                alt={`Spielecke bei ${cafe.name}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {cafe.is_sponsored && (
                <span className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                  Empfohlen
                </span>
              )}
            </div>

            {/* Info */}
            <div className="p-3 space-y-1.5">
              <h3 className="font-display font-bold text-sm leading-tight text-card-foreground group-hover:text-primary transition-colors">
                {cafe.name}
              </h3>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="truncate">{cafe.district}</span>
              </div>

              {cafe.features.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {cafe.features.slice(0, 3).map((f) => (
                    <span key={f} className="text-[10px] font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                      {f}
                    </span>
                  ))}
                  {cafe.features.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{cafe.features.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* CTA card */}
        <div
          className="w-64 shrink-0 rounded-2xl border-2 border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center p-6 cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => navigate("/kindercafe-einreichen")}
        >
          <Coffee className="w-8 h-8 text-primary mb-3" />
          <p className="font-display font-bold text-sm text-center text-card-foreground">
            Kennst du ein Café mit Spielecke?
          </p>
          <p className="text-xs text-muted-foreground text-center mt-1">
            Trage es hier ein!
          </p>
        </div>
      </div>
    </section>
  );
}
