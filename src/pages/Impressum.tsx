import { PageShell } from "@/components/PageShell";

const Impressum = () => (
  <PageShell title="Impressum">
    <section className="space-y-4">
      <h2 className="font-display font-bold text-xl text-foreground">Angaben gemäß § 5 DDG</h2>
      <div className="rounded-2xl border border-border bg-card p-6 space-y-3 text-muted-foreground leading-relaxed" style={{ boxShadow: "var(--shadow-card)" }}>
        <p><span className="font-semibold text-foreground">Name / Firma:</span> [bitte ergänzen]</p>
        <p><span className="font-semibold text-foreground">Anschrift:</span> [bitte ergänzen]</p>
        <p><span className="font-semibold text-foreground">E-Mail:</span> [bitte ergänzen]</p>
        <p><span className="font-semibold text-foreground">Verantwortlich für den Inhalt:</span> [bitte ergänzen]</p>
      </div>
    </section>
  </PageShell>
);

export default Impressum;
