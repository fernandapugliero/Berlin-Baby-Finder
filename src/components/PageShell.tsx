import { Link } from "react-router-dom";
import { Footer } from "./Footer";
import { ArrowLeft } from "lucide-react";

interface PageShellProps {
  title: string;
  children: React.ReactNode;
}

export const PageShell = ({ title, children }: PageShellProps) => (
  <div className="min-h-screen flex flex-col">
    <header className="px-5 pt-8 pb-2 flex items-center justify-between max-w-3xl mx-auto w-full">
      <Link to="/">
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">🟠 Rausmi</h2>
      </Link>
    </header>

    <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-8 space-y-10">
      <div className="space-y-2">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </Link>
        <h1 className="font-display font-bold text-3xl md:text-4xl text-foreground tracking-tight">{title}</h1>
      </div>
      {children}
    </main>

    <Footer />
  </div>
);
