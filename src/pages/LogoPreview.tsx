import logo1 from "@/assets/rausi-logo.png";
import logo2 from "@/assets/rausi-logo-v2.png";
import logo3 from "@/assets/rausi-logo-v3-green.png";
import logo5 from "@/assets/rausi-logo-v5-yellow.png";
import logo6 from "@/assets/rausi-logo-v6-r.png";

const logos = [
  { src: logo1, label: "V1 – Pin + criança (laranja)" },
  { src: logo2, label: "V2 – Bebê fofo no pin (laranja)" },
  { src: logo3, label: "V3 – Silhueta bebê (verde teal)" },
  { src: logo5, label: "V5 – Bebê sorridente (amarelo)" },
  { src: logo6, label: "V6 – R estilizado como pin (laranja)" },
];

const LogoPreview = () => (
  <div className="min-h-screen bg-background p-8">
    <h1 className="font-display text-2xl font-bold mb-8 text-center">Rausi Logo Options</h1>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
      {logos.map((l, i) => (
        <div key={i} className="flex flex-col items-center gap-3 p-6 bg-card rounded-2xl border border-border">
          <img src={l.src} alt={l.label} className="w-24 h-24 object-contain" />
          <p className="text-xs text-center text-muted-foreground font-medium">{l.label}</p>
        </div>
      ))}
    </div>
    <p className="text-center text-xs text-muted-foreground mt-8">Página temporária – será removida depois</p>
  </div>
);

export default LogoPreview;
