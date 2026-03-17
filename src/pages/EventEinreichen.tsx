import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().trim().min(3, "Mindestens 3 Zeichen").max(120),
  description: z.string().trim().max(1000).optional(),
  location_name: z.string().trim().min(2, "Bitte angeben").max(120),
  source_url: z.string().url("Ungültige URL").or(z.literal("")).optional(),
});

type FormValues = z.infer<typeof schema>;

const EventEinreichen = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      location_name: "",
      source_url: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { error } = await supabase.from("activities").insert({
        title: values.title,
        description: values.description || null,
        location_name: values.location_name,
        source_url: values.source_url || null,
        district: "Mitte" as const, // placeholder — admin fills real value
        start_time: new Date().toISOString(), // placeholder — admin fills real value
        source: "community",
        is_approved: false,
        submitted_by: session?.user?.id ?? null,
      });

      if (error) throw error;

      toast.success("Danke! Wir prüfen deinen Vorschlag so schnell wie möglich.");
      navigate("/");
    } catch (e: any) {
      toast.error(`Fehler: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-10 bg-muted/30">
      <header className="px-5 pt-6 pb-4 flex items-center gap-3 bg-card border-b border-border">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display text-xl font-bold">Aktivität vorschlagen</h1>
          <p className="text-xs text-muted-foreground">Teile deinen Tipp mit der Community</p>
        </div>
      </header>

      <div className="px-5 py-6 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl p-5 border border-border space-y-1" style={{ boxShadow: "var(--shadow-card)" }}>
          <p className="text-sm text-muted-foreground mb-4">
            Kennt ihr eine tolle Aktivität für Familien in Berlin? Schlagt sie uns vor — wir prüfen und ergänzen die Details.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name der Aktivität *</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Krabbelgruppe im Familienzentrum" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Was erwartet Eltern und Kinder? Wann findet es statt?" rows={3} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ort *</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Familienzentrum Kreuzberg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full rounded-full gap-2"
                disabled={submitting}
              >
                <Send className="w-4 h-4" />
                {submitting ? "Wird gesendet…" : "Vorschlag einreichen"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EventEinreichen;
