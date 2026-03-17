import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const schema = z.object({
  source_url: z.string().url("Bitte eine gültige URL eingeben"),
  is_free: z.enum(["yes", "no"], { required_error: "Bitte auswählen" }),
  title: z.string().trim().max(120).optional(),
  description: z.string().trim().max(1000).optional(),
  location_name: z.string().trim().max(120).optional(),
  submitter_name: z.string().trim().min(1, "Bitte deinen Namen eingeben").max(100),
  submitter_email: z.string().email("Bitte eine gültige E-Mail eingeben"),
});

type FormValues = z.infer<typeof schema>;

const EventEinreichen = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      source_url: "",
      is_free: undefined,
      title: "",
      description: "",
      location_name: "",
      submitter_name: "",
      submitter_email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from("activities").insert({
        title: values.title || "Community-Vorschlag",
        description: values.description || null,
        location_name: values.location_name || "Wird ergänzt",
        source_url: values.source_url,
        is_free: values.is_free === "yes",
        district: "Mitte" as const,
        start_time: new Date().toISOString(),
        source: "community",
        is_approved: false,
        submitter_name: values.submitter_name,
        submitter_email: values.submitter_email,
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
          <h1 className="font-display text-xl font-bold">Event vorschlagen</h1>
          <p className="text-xs text-muted-foreground">Teile deinen Tipp mit der Community</p>
        </div>
      </header>

      <div className="px-5 py-6 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl p-5 border border-border space-y-1" style={{ boxShadow: "var(--shadow-card)" }}>
          <p className="text-sm text-muted-foreground mb-4">
            Schick uns einfach den Link — wir kümmern uns um den Rest!
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="source_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link zum Event *</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_free"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Ist das Event kostenlos? *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="yes" id="free-yes" />
                          <label htmlFor="free-yes" className="text-sm cursor-pointer">Ja, kostenlos</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id="free-no" />
                          <label htmlFor="free-no" className="text-sm cursor-pointer">Nein, kostenpflichtig</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t border-border" />

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Name des Events</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Baby-Konzert im Familienzentrum" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Ort</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. Familienzentrum Kreuzberg" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Beschreibung</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Do que se trata o evento? Qual o público-alvo? Compartilhe o máximo de detalhes possível."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t border-border" />

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="submitter_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dein Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Vor- und Nachname" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="submitter_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deine E-Mail *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="deine@email.de" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full rounded-full gap-2"
                disabled={submitting}
              >
                <Send className="w-4 h-4" />
                {submitting ? "Wird gesendet…" : "Event einreichen"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default EventEinreichen;
