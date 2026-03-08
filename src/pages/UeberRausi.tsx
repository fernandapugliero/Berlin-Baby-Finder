import { PageShell } from "@/components/PageShell";
import { Link } from "react-router-dom";

const UeberRausi = () => (
  <PageShell title="Über Rausi">
    <p className="text-lg text-muted-foreground leading-relaxed">
      Rausi hilft Eltern in Berlin, passende Aktivitäten für Babys, Kleinkinder und Kita-Kinder zu finden – für jetzt, heute oder morgen.
    </p>

    <section className="space-y-3">
      <h2 className="font-display font-bold text-xl text-foreground">Warum es Rausi gibt</h2>
      <p className="text-muted-foreground leading-relaxed">
        Viele Angebote für Familien in Berlin sind über verschiedene Websites verstreut. Rausi macht sie leichter auffindbar.
      </p>
    </section>

    <section className="space-y-3">
      <h2 className="font-display font-bold text-xl text-foreground">Für wen Rausi ist</h2>
      <p className="text-muted-foreground leading-relaxed">
        Für Eltern, die spontan etwas mit ihren Kindern unternehmen möchten – im Kiez oder in ganz Berlin.
      </p>
    </section>

    <section className="space-y-3">
      <h2 className="font-display font-bold text-xl text-foreground">Was du auf Rausi findest</h2>
      <p className="text-muted-foreground leading-relaxed">
        Familienzentren, Krabbelgruppen, Spielgruppen, Kurse und weitere Aktivitäten für Kinder.
      </p>
    </section>

    <div>
      <Link
        to="/"
        className="inline-flex items-center justify-center h-11 px-8 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:bg-primary/90 transition-colors"
      >
        Aktivitäten entdecken
      </Link>
    </div>
  </PageShell>
);

export default UeberRausi;
