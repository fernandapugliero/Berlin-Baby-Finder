import { useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { Link } from "react-router-dom";
import { MapPin, Users, Baby, Heart, Music } from "lucide-react";

const offerings = [
  { icon: MapPin, label: "Familienzentren" },
  { icon: Baby, label: "Krabbelgruppen und Spielgruppen" },
  { icon: Music, label: "Eltern-Kind-Kurse" },
  { icon: Users, label: "Offene Treffs für Familien" },
  { icon: Heart, label: "Aktivitäten für Babys und Kleinkinder" },
];

const UeberRausi = () => {
  useEffect(() => {
    document.title = "Über Rausmi – Aktivitäten für Kinder in Berlin finden";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute("content", "Rausmi hilft Familien in Berlin, Aktivitäten für Babys, Kleinkinder und Kita-Kinder zu entdecken – für jetzt, heute oder morgen.");
    } else {
      const tag = document.createElement("meta");
      tag.name = "description";
      tag.content = "Rausmi hilft Familien in Berlin, Aktivitäten für Babys, Kleinkinder und Kita-Kinder zu entdecken – für jetzt, heute oder morgen.";
      document.head.appendChild(tag);
    }
  }, []);

  return (
    <PageShell title="Über Rausmi">
      {/* Hero subtitle */}
      <div className="space-y-4">
        <p className="text-lg text-muted-foreground leading-relaxed">
          Rausmi hilft Familien in Berlin, passende Aktivitäten für Babys, Kleinkinder und Kita-Kinder zu finden – genau dann, wenn du raus willst.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Statt lange zu suchen, siehst du sofort, was heute oder jetzt in deiner Nähe stattfindet.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center h-11 px-8 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Aktivitäten entdecken
        </Link>
      </div>

      {/* Das Problem */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl text-foreground">Warum es Rausmi gibt</h2>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-3 text-muted-foreground leading-relaxed" style={{ boxShadow: "var(--shadow-card)" }}>
          <p>Viele Angebote für Familien in Berlin sind schwer zu finden.</p>
          <p>Familienzentren, Krabbelgruppen, Kurse und offene Treffs stehen oft auf verschiedenen Websites oder in PDFs.</p>
          <p>Wenn man spontan etwas mit seinem Kind unternehmen möchte, weiß man oft nicht, wo man anfangen soll.</p>
          <p className="font-medium text-foreground">Rausmi sammelt diese Angebote an einem Ort und macht sie leichter auffindbar.</p>
        </div>
      </section>

      {/* Was du findest */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl text-foreground">Was du auf Rausmi findest</h2>
        <div className="grid gap-3">
          {offerings.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card px-5 py-4 transition-all"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display font-semibold text-sm text-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Für wen */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl text-foreground">Für wen Rausmi gemacht ist</h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>Rausmi ist für Eltern und Familien in Berlin, die spontan etwas mit ihren Kindern unternehmen möchten.</p>
          <p>Egal ob Baby, Kleinkind oder Kita-Kind – Rausmi zeigt dir Aktivitäten, die zu eurem Alltag passen.</p>
        </div>
      </section>

      {/* Unsere Idee */}
      <section className="space-y-4">
        <h2 className="font-display font-bold text-xl text-foreground">Unsere Idee</h2>
        <div className="space-y-3 text-muted-foreground leading-relaxed">
          <p>Wir glauben, dass Familienangebote leichter zugänglich sein sollten.</p>
          <p>Berlin hat unglaublich viele tolle Orte für Familien – man muss nur wissen, wo sie sind.</p>
          <p>Rausmi möchte dabei helfen, diese Angebote sichtbar zu machen.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-primary/20 bg-card p-8 text-center space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <h2 className="font-display font-bold text-xl text-foreground">Bereit etwas zu unternehmen?</h2>
        <Link
          to="/"
          className="inline-flex items-center justify-center h-11 px-8 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Aktivitäten entdecken
        </Link>
      </section>
    </PageShell>
  );
};

export default UeberRausi;
