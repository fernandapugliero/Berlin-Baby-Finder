import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Mail } from "lucide-react";
import { toast } from "sonner";

const Kontakt = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Danke für deine Nachricht! Wir melden uns bald.");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <PageShell title="Kontakt">
      <p className="text-lg text-muted-foreground leading-relaxed">
        Du kennst ein tolles Angebot für Familien in Berlin oder möchtest mit Rausi Kontakt aufnehmen? Schreib uns.
      </p>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-2" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <a href="mailto:hallo@rausi.de" className="font-display font-semibold text-foreground hover:text-primary transition-colors">
            hallo@rausi.de
          </a>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="font-display font-bold text-xl text-foreground">Für Familienzentren und Veranstalter</h2>
        <p className="text-muted-foreground leading-relaxed">
          Ihr möchtet, dass eure Angebote auf Rausi erscheinen? Meldet euch gern.
        </p>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="font-display font-bold text-xl text-foreground">Nachricht senden</h2>
        <input
          type="text"
          placeholder="Name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <input
          type="email"
          placeholder="E-Mail"
          required
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="flex h-11 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <textarea
          placeholder="Nachricht"
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          className="flex w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center h-11 px-8 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          Senden
        </button>
      </form>
    </PageShell>
  );
};

export default Kontakt;
