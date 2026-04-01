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
  submission_type: z.enum(["new", "correction"], { required_error: "Bitte auswählen" }),
  title: z.string().trim().min(1, "Bitte den Namen der Aktivität eingeben").max(120),
  location_name: z.string().trim().min(1, "Bitte den Ort eingeben").max(120),
  day_of_week: z.string().trim().min(1, "Bitte den Wochentag angeben").max(50),
  frequency: z.string().trim().min(1, "Bitte die Häufigkeit angeben").max(100),
  start_time_input: z.string().min(1, "Bitte die Startzeit angeben"),
  end_time_input: z.string().min(1, "Bitte die Endzeit angeben"),
  description: z.string().trim().min(1, "Bitte eine Beschreibung eingeben").max(1000),
  source_url: z.string().url("Bitte eine gültige URL eingeben").optional().or(z.literal("")),
  is_free: z.enum(["yes", "no"], { required_error: "Bitte auswählen" }),
  price: z.string().optional().or(z.literal("")),
  registration_required: z.enum(["yes", "no"], { required_error: "Bitte auswählen" }),
  submitter_name: z.string().trim().min(1, "Bitte deinen Namen eingeben").max(100),
  submitter_email: z.string().email("Bitte eine gültige E-Mail eingeben"),
}).refine((data) => {
  if (data.is_free === "no") {
    return data.price && data.price.trim().length > 0;
  }
  return true;
}, {
  message: "Bitte den Preis angeben",
  path: ["price"],
});

type FormValues = z.infer<typeof schema>;

const AktivitaetEinreichen = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      submission_type: undefined,
      title: "",
      location_name: "",
      day_of_week: "",
      frequency: "",
      start_time_input: "",
      end_time_input: "",
      description: "",
      source_url: "",
      is_free: undefined,
      price: "",
      registration_required: undefined,
      submitter_name: "",
      submitter_email: "",
    },
  });

  const isFree = form.watch("is_free");

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const descParts = [
        values.description,
        `Wochentag: ${values.day_of_week}`,
        `Häufigkeit: ${values.frequency}`,
        values.submission_type === "correction" ? "[KORREKTUR einer bestehenden Aktivität]" : "[NEUE Aktivität]",
      ];

      const { error } = await supabase.from("activities").insert({
        title: values.title,
        description: descParts.join("\n\n"),
        location_name: values.location_name,
        source_url: values.source_url || null,
        is_free: values.is_free === "yes",
        price_info: values.is_free === "no" && values.price ? `${values.price} €` : null,
        registration_required: values.registration_required === "yes",
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
          <h1 className="font-display text-xl font-bold">Aktivität einreichen</h1>
          <p className="text-xs text-muted-foreground">Hilf dem Rausmi zu wachsen</p>
        </div>
      </header>

      <div className="px-5 py-6 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl p-5 border border-border space-y-1" style={{ boxShadow: "var(--shadow-card)" }}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* New or Correction */}
              <FormField
                control={form.control}
                name="submission_type"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Worum geht es? *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="new" id="type-new" />
                          <label htmlFor="type-new" className="text-sm cursor-pointer">Neue Aktivität (noch nicht im Rausi)</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="correction" id="type-correction" />
                          <label htmlFor="type-correction" className="text-sm cursor-pointer">Korrektur einer bestehenden Aktivität</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t border-border" />

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
                name="day_of_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wochentag *</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Montag, Mittwoch und Freitag" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Häufigkeit *</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Wöchentlich, Alle 2 Wochen, Monatlich" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="start_time_input"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beginn *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_time_input"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ende *</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="registration_required"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Anmeldung erforderlich? *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="yes" id="reg-yes" />
                          <label htmlFor="reg-yes" className="text-sm cursor-pointer">Ja</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <RadioGroupItem value="no" id="reg-no" />
                          <label htmlFor="reg-no" className="text-sm cursor-pointer">Nein</label>
                        </div>
                      </RadioGroup>
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
                    <FormLabel>Kostenlos? *</FormLabel>
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

              {isFree === "no" && (
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preis in Euro *</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="0.01" placeholder="z.B. 5.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Worum geht es bei der Aktivität? Für welche Altersgruppe ist sie gedacht? Teile so viele Details wie möglich."
                        rows={3}
                        {...field}
                      />
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
                {submitting ? "Wird gesendet…" : "Aktivität einreichen"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AktivitaetEinreichen;
