import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="mt-16 border-t border-border bg-muted/30">
    <div className="max-w-3xl mx-auto px-5 py-10 space-y-6">
      <div className="flex items-center gap-2">
        <span className="font-display text-lg font-bold text-foreground">🟠 Rausi</span>
      </div>
      <p className="text-sm text-muted-foreground max-w-md">
        Aktivitäten für Babys und Kleinkinder in Berlin – für jetzt, heute oder morgen.
      </p>
      <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium">
        <Link to="/ueber" className="text-muted-foreground hover:text-foreground transition-colors">Über Rausi</Link>
        <Link to="/kontakt" className="text-muted-foreground hover:text-foreground transition-colors">Kontakt</Link>
        <Link to="/impressum" className="text-muted-foreground hover:text-foreground transition-colors">Impressum</Link>
        <Link to="/datenschutz" className="text-muted-foreground hover:text-foreground transition-colors">Datenschutz</Link>
      </nav>
      <p className="text-xs text-muted-foreground/60">© {new Date().getFullYear()} Rausi</p>
    </div>
  </footer>
);
