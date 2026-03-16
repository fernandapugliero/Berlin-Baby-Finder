import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { BERLIN_DISTRICTS } from "@/lib/types";
import { toast } from "sonner";
import type { BerlinDistrict } from "@/lib/types";

const schema = z.object({
  title: z.string().trim().min(3, "Mindestens 3 Zeichen").max(120),
  description: z.string().trim().max(1000).optional(),
  location_name: z.string().trim().min(2, "Bitte angeben").max(120),
  address: z.string().trim().max(200).optional(),
  district: z.string().min(1, "Bitte wählen"),
  start_date: z.string().min(1, "Bitte angeben"),
  start_time: z.string().min(1, "Bitte angeben"),
  end_time: z.string().optional(),
  is_free: z.boolean(),
  price_info: z.string().trim().max(100).optional(),
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
      address: "",
      district: "",
      start_date: "",
      start_time: "",
      end_time: "",
      is_free: true,
      price_info: "",
      source_url: "",
    },
  });

  const isFree = form.watch("is_free");

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setSubmitting(true);
    try {
      const startDateTime = new Date(`${values.start_date}T${values.start_time}`);
      let endDateTime: Date | null = null;
      if (values.end_time) {
        endDateTime = new Date(`${values.start_date}T${values.end_time}`);
      }

      const { error } = await supabase.from("activities").insert({
        title: values.title,
        description: values.description || null,
        location_name: values.location_name,
        address: values.address || null,
        district: values.district as BerlinDistrict,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime?.toISOString() ?? null,
        is_free: values.is_free,
        price_info: values.is_free ? null : (values.price_info || null),
        source_url: values.source_url || null,
        source: "community",
        is_approved: false,
        submitted_by: user.id,
      });

      if (error) throw error;

      toast.success("Event eingereicht! Wir prüfen es so schnell wie möglich.");
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
          <h1 className="font-display text-xl font-bold">Event einreichen</h1>
          <p className="text-xs text-muted-foreground">Teile dein Event mit der Community</p>
        </div>
      </header>

      <div className="px-5 py-6 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl p-5 border border-border space-y-1" style={{ boxShadow: "var(--shadow-card)" }}>
          <p className="text-sm text-muted-foreground mb-4">
            Nach dem Einreichen wird dein Event von uns geprüft und freigeschaltet.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel *</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Krabbelgruppe im Park" {...field} />
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
                      <Textarea placeholder="Was erwartet die Eltern und Kinder?" rows={3} {...field} />
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
                    <FormLabel>Ort / Venue *</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. Familienzentrum Kreuzberg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input placeholder="Straße, Nr., PLZ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bezirk *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Bezirk wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BERLIN_DISTRICTS.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Datum *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="start_time"
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
              </div>

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ende (optional)</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_free"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                    <FormLabel className="text-sm font-medium">Kostenlos</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {!isFree && (
                <FormField
                  control={form.control}
                  name="price_info"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preis</FormLabel>
                      <FormControl>
                        <Input placeholder="z.B. 5€ pro Kind" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="source_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link zum Event (optional)</FormLabel>
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
                {submitting ? "Wird eingereicht…" : user ? "Event einreichen" : "Einloggen & einreichen"}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default EventEinreichen;
