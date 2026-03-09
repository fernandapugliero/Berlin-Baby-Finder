import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EyeOff, Eye, Pencil, Pause, Play, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { fetchAllActivities, fetchAllCrawlerEventsForAdmin } from "@/lib/activity-queries";
import { toast } from "sonner";

interface Override {
  id: string;
  event_key: string;
  hidden: boolean;
  paused_until: string | null;
  title_override: string | null;
  description_override: string | null;
  age_override: string | null;
  district_override: string | null;
  notes: string | null;
}

export function CrawlerOverridesAdmin() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingEvent, setEditingEvent] = useState<{
    id: string;
    title: string;
    location: string;
    override?: Override;
  } | null>(null);

  // Form state
  const [formHidden, setFormHidden] = useState(false);
  const [formPausedUntil, setFormPausedUntil] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAge, setFormAge] = useState("");
  const [formDistrict, setFormDistrict] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const { data: crawlerEvents } = useQuery({
    queryKey: ["crawler-events-admin"],
    queryFn: fetchAllCrawlerEventsForAdmin,
  });

  const { data: overrides } = useQuery({
    queryKey: ["crawler-overrides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("crawler_overrides")
        .select("*");
      if (error) throw error;
      return data as Override[];
    },
  });

  const overrideMap = new Map<string, Override>();
  overrides?.forEach((o) => overrideMap.set(o.event_key, o));

  // Only show crawler events (id starts with "evt-")
  const crawlerOnly = crawlerEvents?.filter((e) => e.id.startsWith("evt-")) ?? [];
  const filtered = crawlerOnly.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location_name.toLowerCase().includes(search.toLowerCase())
  );

  // Include hidden events from overrides that might not appear in crawlerOnly
  const hiddenKeys = new Set<string>();
  overrides?.forEach((o) => {
    if (o.hidden || (o.paused_until && new Date(o.paused_until) > new Date())) {
      hiddenKeys.add(o.event_key);
    }
  });

  const upsertMutation = useMutation({
    mutationFn: async (data: {
      event_key: string;
      hidden: boolean;
      paused_until: string | null;
      title_override: string | null;
      description_override: string | null;
      age_override: string | null;
      district_override: string | null;
      notes: string | null;
    }) => {
      const { error } = await supabase
        .from("crawler_overrides")
        .upsert(data, { onConflict: "event_key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crawler-overrides"] });
      queryClient.invalidateQueries({ queryKey: ["crawler-events-all"] });
      toast.success("Override gespeichert");
      setEditingEvent(null);
    },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  const quickHideMutation = useMutation({
    mutationFn: async ({ eventKey, hidden }: { eventKey: string; hidden: boolean }) => {
      const { error } = await supabase
        .from("crawler_overrides")
        .upsert({ event_key: eventKey, hidden }, { onConflict: "event_key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crawler-overrides"] });
      queryClient.invalidateQueries({ queryKey: ["crawler-events-all"] });
      toast.success("Aktualisiert");
    },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  const openEditor = (event: typeof crawlerOnly[number]) => {
    const override = overrideMap.get(event.id);
    setFormHidden(override?.hidden ?? false);
    setFormPausedUntil(override?.paused_until?.slice(0, 10) ?? "");
    setFormTitle(override?.title_override ?? event.title);
    setFormDescription(override?.description_override ?? event.description ?? "");
    setFormAge(override?.age_override ?? (event.age_groups?.length ? event.age_groups.join(", ") : ""));
    setFormDistrict(override?.district_override ?? event.district ?? "");
    setFormNotes(override?.notes ?? "");
    setEditingEvent({ id: event.id, title: event.title, location: event.location_name, override });
  };

  const handleSave = () => {
    if (!editingEvent) return;
    upsertMutation.mutate({
      event_key: editingEvent.id,
      hidden: formHidden,
      paused_until: formPausedUntil ? new Date(formPausedUntil).toISOString() : null,
      title_override: formTitle || null,
      description_override: formDescription || null,
      age_override: formAge || null,
      district_override: formDistrict || null,
      notes: formNotes || null,
    });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Event suchen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-full"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length} Crawler-Events · {hiddenKeys.size} versteckt/pausiert
      </p>

      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {filtered.map((event) => {
          const override = overrideMap.get(event.id);
          const isHidden = override?.hidden;
          const isPaused = override?.paused_until && new Date(override.paused_until) > new Date();

          return (
            <div
              key={event.id}
              className={`bg-card rounded-xl p-3 border border-border space-y-1 ${
                isHidden || isPaused ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-sm truncate">
                    {override?.title_override || event.title}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {event.location_name} · {event.district}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isHidden && <Badge variant="destructive" className="text-[10px] px-1.5">Versteckt</Badge>}
                  {isPaused && <Badge variant="secondary" className="text-[10px] px-1.5">Pausiert</Badge>}
                  {override && !isHidden && !isPaused && (
                    <Badge variant="outline" className="text-[10px] px-1.5">Bearbeitet</Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-1.5 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-1 text-xs h-7 px-2"
                  onClick={() => openEditor(event)}
                >
                  <Pencil className="w-3 h-3" />
                  Bearbeiten
                </Button>
                <Button
                  variant={isHidden ? "default" : "outline"}
                  size="sm"
                  className="rounded-full gap-1 text-xs h-7 px-2"
                  onClick={() =>
                    quickHideMutation.mutate({
                      eventKey: event.id,
                      hidden: !isHidden,
                    })
                  }
                >
                  {isHidden ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {isHidden ? "Anzeigen" : "Verstecken"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Event bearbeiten</DialogTitle>
            <p className="text-xs text-muted-foreground">{editingEvent?.title}</p>
            <p className="text-xs text-muted-foreground">{editingEvent?.location}</p>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium">Titel überschreiben</label>
              <Input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Neuer Titel (leer = Original)"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-medium">Beschreibung hinzufügen</label>
              <Textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Beschreibung..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium">Alter überschreiben</label>
                <Input
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value)}
                  placeholder="z.B. 0-3 Jahre"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-medium">Bezirk überschreiben</label>
                <Input
                  value={formDistrict}
                  onChange={(e) => setFormDistrict(e.target.value)}
                  placeholder="z.B. Neukölln"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium">Pausiert bis (Datum)</label>
              <Input
                type="date"
                value={formPausedUntil}
                onChange={(e) => setFormPausedUntil(e.target.value)}
                className="mt-1"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Event wird bis zu diesem Datum versteckt (z.B. Feiertage)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formHidden}
                onChange={(e) => setFormHidden(e.target.checked)}
                id="hidden-check"
                className="rounded"
              />
              <label htmlFor="hidden-check" className="text-xs font-medium">
                Dauerhaft verstecken
              </label>
            </div>

            <div>
              <label className="text-xs font-medium">Notizen (intern)</label>
              <Input
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="Interne Notiz..."
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={upsertMutation.isPending}
                className="rounded-full flex-1"
              >
                Speichern
              </Button>
              <Button
                variant="outline"
                onClick={() => setEditingEvent(null)}
                className="rounded-full"
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
