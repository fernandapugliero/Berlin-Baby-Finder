import { useState } from "react";
import { Mail, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .insert({ email: email.trim().toLowerCase() });

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
    <section className="rounded-2xl border border-primary/20 bg-card p-5 space-y-3" style={{ boxShadow: "var(--shadow-card)" }}>
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
          disabled={loading}
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
