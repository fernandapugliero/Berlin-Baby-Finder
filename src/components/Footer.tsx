import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="mt-16 border-t border-border bg-muted/30">
    <div className="max-w-3xl mx-auto px-5 py-10 space-y-8">
      {/* Brand */}
      <div className="space-y-2">
        <span className="font-display text-lg font-bold text-foreground">🟠 Rausmi</span>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          Rausmi hilft Familien in Berlin, passende Aktivitäten für Babys, Kleinkinder und Kita-Kinder zu finden.
        </p>
      </div>

      {/* Nav links */}
      <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
        <Link to="/ueber" className="text-muted-foreground hover:text-foreground transition-colors py-1">Über Rausi</Link>
        <Link to="/kontakt" className="text-muted-foreground hover:text-foreground transition-colors py-1">Kontakt</Link>
        <Link to="/impressum" className="text-muted-foreground hover:text-foreground transition-colors py-1">Impressum</Link>
        <Link to="/datenschutz" className="text-muted-foreground hover:text-foreground transition-colors py-1">Datenschutz</Link>
      </nav>

      {/* Trust text */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground/70">
        <span>Für Familien in Berlin gemacht</span>
        <span>·</span>
        <span>Entdecke Aktivitäten in deiner Nähe</span>
        <span>·</span>
        <span>Termine und Angebote an einem Ort</span>
      </div>

      {/* Copyright */}
      <p className="text-xs text-muted-foreground/50">
        Mit ❤️ für Familien in Berlin · © {new Date().getFullYear()} Rausi
      </p>
    </div>
  </footer>
);
