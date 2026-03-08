import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Globe, Mail, Coffee, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import kindercafePlaceholder from "@/assets/kindercafe-placeholder.jpg";

const KindercafeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: cafe, isLoading } = useQuery({
    queryKey: ["kindercafe", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("kindercafes")
        .select("*")
        .eq("id", id!)
        .eq("is_approved", true)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen px-5 pt-6">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-48 w-full rounded-2xl bg-muted animate-pulse" />
          <div className="h-8 w-3/4 rounded-xl bg-muted animate-pulse" />
          <div className="h-4 w-full rounded-lg bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <div className="text-center">
          <h2 className="font-display font-semibold text-lg mb-2">Café nicht gefunden</h2>
          <Button variant="outline" className="rounded-full" onClick={() => navigate("/")}>
            Zurück
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Top bar */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full -ml-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Link to="/" className="font-display font-semibold text-sm text-muted-foreground hover:text-primary transition-colors">
          🟠 Rausi
        </Link>
      </header>

      {/* Hero image */}
      <div className="px-5 mb-6">
        <div className="rounded-2xl overflow-hidden h-48 md:h-64">
          <img
            src={cafe.image_url || kindercafePlaceholder}
            alt={cafe.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="px-5 space-y-6">
        {/* Title */}
        <div>
          <h1 className="font-display font-bold text-2xl leading-tight text-foreground">
            {cafe.name}
          </h1>
          {cafe.is_sponsored && (
            <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
              Empfohlen
            </span>
          )}
        </div>

        {/* Description */}
        {cafe.description && (
          <p className="text-base text-muted-foreground leading-relaxed">
            {cafe.description}
          </p>
        )}

        {/* Info card */}
        <div className="space-y-4 bg-card rounded-2xl p-5 border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
          {cafe.address && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-sm font-medium block">{cafe.address}</span>
                <span className="text-xs text-muted-foreground">{cafe.district}</span>
              </div>
            </div>
          )}

          {cafe.website_url && (
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary shrink-0" />
              <a
                href={cafe.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary font-medium hover:underline truncate"
              >
                Website besuchen
              </a>
            </div>
          )}

          {cafe.contact_email && (
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary shrink-0" />
              <a
                href={`mailto:${cafe.contact_email}`}
                className="text-sm text-primary font-medium hover:underline"
              >
                {cafe.contact_email}
              </a>
            </div>
          )}
        </div>

        {/* Features */}
        {cafe.features && cafe.features.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-display font-semibold text-sm text-muted-foreground">Ausstattung</h2>
            <div className="flex flex-wrap gap-2">
              {cafe.features.map((f: string) => (
                <span key={f} className="chip chip-age">
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Google Maps link */}
        {cafe.google_maps_url && (
          <a
            href={cafe.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            In Google Maps öffnen
          </a>
        )}
      </div>
    </div>
  );
};

export default KindercafeDetail;
