import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DISTRICT_OPTIONS = [
  { value: "berlin", label: "Ganz Berlin" },
  { value: "kreuzberg", label: "Kreuzberg" },
  { value: "neukoelln", label: "Neukölln" },
  { value: "friedrichshain", label: "Friedrichshain" },
  { value: "mitte", label: "Mitte" },
  { value: "prenzlauerberg", label: "Prenzlauer Berg" },
] as const;

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>(["berlin"]);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const toggleDistrict = (value: string) => {
    if (value === "berlin") {
      // "Ganz Berlin" toggles all off and selects only berlin
      setSelectedDistricts(prev => 
        prev.includes("berlin") ? [] : ["berlin"]
      );
      return;
    }
    setSelectedDistricts(prev => {
      const without = prev.filter(d => d !== "berlin" && d !== value);
      if (prev.includes(value)) {
        return without;
      }
      return [...without, value];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || selectedDistricts.length === 0 || !consent) {
      if (selectedDistricts.length === 0) {
        toast.error("Bitte wähle mindestens einen Bezirk aus.");
      }
      if (!consent) {
        toast.error("Bitte stimme der Datenschutzerklärung zu.");
      }
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({
          email: email.trim().toLowerCase(),
          districts: selectedDistricts,
        });

      if (error) {
        if (error.code === "23505") {
          toast.info("Du bist bereits angemeldet!");
          setSubscribed(true);
        } else {
          throw error;
        }
      } else {
        setSubscribed(true);
        toast.success("Du bist dabei! 🎉");
      }
    } catch (e: any) {
      toast.error(`Fehler: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <section className="rounded-2xl border border-secondary/30 bg-secondary/5 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
            <Check className="w-5 h-5 text-secondary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-card-foreground">
              Du bist angemeldet! 🎉
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ab morgen bekommst du jeden Morgen 5 Ideen für den Tag.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-primary/20 bg-card p-5 space-y-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-display font-bold text-base text-card-foreground leading-snug">
            Heute mit Kindern in Berlin 👶
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Jeden Morgen 5 Ideen — kostenlos per E-Mail.
          </p>
        </div>
      </div>

      {/* District selection */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Für welche Bezirke interessierst du dich?
        </p>
        <div className="flex flex-wrap gap-2">
          {DISTRICT_OPTIONS.map((district) => {
            const isChecked = selectedDistricts.includes(district.value);
            return (
              <button
                key={district.value}
                type="button"
                onClick={() => toggleDistrict(district.value)}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium 
                  border transition-all cursor-pointer
                  ${isChecked
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-muted/30 border-border text-muted-foreground hover:border-primary/30"
                  }
                `}
              >
                {isChecked && <Check className="w-3 h-3" />}
                {district.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Consent checkbox */}
      <label className="flex items-start gap-2 cursor-pointer group">
        <Checkbox
          checked={consent}
          onCheckedChange={(checked) => setConsent(checked === true)}
          className="mt-0.5 shrink-0"
        />
        <span className="text-[11px] text-muted-foreground leading-snug">
          Ich stimme zu, regelmäßig Aktivitäts-Empfehlungen per E-Mail zu erhalten. Ich kann mich jederzeit abmelden.{" "}
          <a href="/datenschutz" className="underline hover:text-foreground">
            Datenschutzerklärung
          </a>
        </span>
      </label>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="deine@email.de"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded-full text-sm h-10"
        />
        <Button
          type="submit"
          size="sm"
          className="rounded-full px-5 h-10 shrink-0"
          disabled={loading || selectedDistricts.length === 0 || !consent}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Anmelden"}
        </Button>
      </form>

      <p className="text-[11px] text-muted-foreground">
        Kein Spam · Jederzeit abmelden
      </p>
    </section>
  );
}
