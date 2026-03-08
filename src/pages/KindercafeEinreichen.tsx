import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Send, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AuthDialog } from "@/components/AuthDialog";
import { BERLIN_DISTRICTS } from "@/lib/types";
import { toast } from "sonner";
import type { BerlinDistrict } from "@/lib/types";

const schema = z.object({
  name: z.string().trim().min(2, "Mindestens 2 Zeichen").max(120),
  description: z.string().trim().max(500).optional(),
  address: z.string().trim().min(3, "Bitte angeben").max(200),
  district: z.string().min(1, "Bitte wählen"),
  website_url: z.string().url("Ungültige URL").or(z.literal("")).optional(),
  google_maps_url: z.string().url("Ungültige URL").or(z.literal("")).optional(),
  contact_email: z.string().email("Ungültige E-Mail").or(z.literal("")).optional(),
});

type FormValues = z.infer<typeof schema>;

const FEATURES = [
  "Spielecke", "Kinderstühle", "Wickeltisch", "Hochstühle",
  "Kinderbücher", "Outdoor-Spielplatz", "Kindermenü", "Stillraum",
];

const KindercafeEinreichen = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      district: "",
      website_url: "",
      google_maps_url: "",
      contact_email: "",
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Bild darf max. 5 MB groß sein");
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const toggleFeature = (f: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) {
      setShowAuth(true);
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;

      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("kindercafe-photos")
          .upload(path, photoFile);
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage
          .from("kindercafe-photos")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("kindercafes").insert({
        name: values.name,
        description: values.description || null,
        address: values.address,
        district: values.district as BerlinDistrict,
        website_url: values.website_url || null,
        google_maps_url: values.google_maps_url || null,
        contact_email: values.contact_email || null,
        features: selectedFeatures,
        image_url: imageUrl,
        is_approved: false,
        submitted_by: user.id,
      });

      if (error) throw error;

      toast.success("Danke! Wir prüfen deinen Vorschlag und melden uns.");
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
          <h1 className="font-display text-xl font-bold">Kindercafé eintragen</h1>
          <p className="text-xs text-muted-foreground">Café oder Restaurant mit Spielecke</p>
        </div>
      </header>

      <div className="px-5 py-6 max-w-lg mx-auto">
        <div className="bg-card rounded-2xl p-5 border border-border space-y-1" style={{ boxShadow: "var(--shadow-card)" }}>
          <p className="text-sm text-muted-foreground mb-4">
            Kennst du ein Café oder Restaurant mit Spielecke für Kinder? Trage es hier ein — wir kontaktieren das Lokal und veröffentlichen es.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name des Cafés *</FormLabel>
                    <FormControl>
                      <Input placeholder="z.B. La Fève" {...field} />
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
                      <Textarea placeholder="Was macht diesen Ort besonders für Familien?" rows={3} {...field} />
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
                    <FormLabel>Adresse *</FormLabel>
                    <FormControl>
                      <Input placeholder="Straße, Nr., PLZ Berlin" {...field} />
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

              {/* Features */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ausstattung</label>
                <div className="flex flex-wrap gap-2">
                  {FEATURES.map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFeature(f)}
                      className={`text-xs font-medium rounded-full px-3 py-1.5 border transition-all ${
                        selectedFeatures.includes(f)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:border-primary/30"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Foto der Spielecke</label>
                {photoPreview ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={photoPreview} alt="Preview" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/30 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Foto hochladen (max. 5 MB)</span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhotoChange} />
                  </label>
                )}
              </div>

              <FormField
                control={form.control}
                name="google_maps_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Maps Link</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://maps.google.com/..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (optional)</FormLabel>
                    <FormControl>
                      <Input type="url" placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kontakt-E-Mail (optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="kontakt@cafe.de" {...field} />
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
                {submitting ? "Wird eingereicht…" : user ? "Café einreichen" : "Einloggen & einreichen"}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <AuthDialog open={showAuth} onOpenChange={setShowAuth} />
    </div>
  );
};

export default KindercafeEinreichen;
