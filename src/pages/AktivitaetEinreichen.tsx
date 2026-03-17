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
  title: z.string().trim().max(120).optional().or(z.literal("")),
  location_name: z.string().trim().max(120).optional().or(z.literal("")),
  date: z.string().optional().or(z.literal("")),
  start_time_input: z.string().optional().or(z.literal("")),
  end_time_input: z.string().optional().or(z.literal("")),
  registration_required: z.enum(["yes", "no"]).optional(),
  is_free: z.enum(["yes", "no"]).optional(),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  source_url: z.string().url("Bitte eine gültige URL eingeben").optional().or(z.literal("")),
  submitter_name: z.string().trim().max(100).optional().or(z.literal("")),
  submitter_email: z.string().email("Ungültige E-Mail").optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

const AktivitaetEinreichen = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      location_name: "",
      date: "",
      start_time_input: "",
      end_time_input: "",
      registration_required: undefined,
      is_free: undefined,
      description: "",
      source_url: "",
      submitter_name: "",
      submitter_email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      let startTime = new Date().toISOString();
      let endTime: string | null = null;

      if (values.date) {
        const date = values.date;
        const time = values.start_time_input || "00:00";
        startTime = new Date(`${date}T${time}`).toISOString();

        if (values.end_time_input) {
          endTime = new Date(`${date}T${values.end_time_input}`).toISOString();
        }
      }

      const { error } = await supabase.from("activities").insert({
        title: values.title || "Community-Vorschlag",
        description: values.description || null,
        location_name: values.location_name || "Wird ergänzt",
        source_url: values.source_url || null,
        is_free: values.is_free === "yes" ? true : values.is_free === "no" ? false : true,
        registration_required: values.registration_required === "yes",
        district: "Mitte" as const,
        start_time: startTime,
        end_time: endTime,
        source: "community",
        is_approved: false,
        submitter_name: values.submitter_name || null,
        submitter_email: values.submitter_email || null,
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
            Kennst du eine tolle Aktivität für Familien? Alle Felder sind optional — teile so viele Infos wie du möchtest.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name der Aktivität</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Krabbelgruppe im Familienzentrum" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ort</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Familienzentrum Kreuzberg" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Datum</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="start_time_input"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beginn</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_time_input"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ende</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="registration_required"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Anmeldung erforderlich?</FormLabel>
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
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_free"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Kostenlos?</FormLabel>
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
                      <Textarea
                        placeholder="Worum geht es bei der Aktivität? Für wen ist sie gedacht? Teile so viele Details wie möglich."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="source_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link</FormLabel>
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
                      <FormLabel className="text-xs">Dein Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Vor- und Nachname" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="submitter_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Deine E-Mail</FormLabel>
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
