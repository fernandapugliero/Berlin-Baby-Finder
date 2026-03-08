import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { approveActivity, deleteActivity } from "@/lib/activity-queries";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showApproved, setShowApproved] = useState(false);

  const { data: activities, isLoading } = useQuery({
    queryKey: ["admin-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activities"] });
      toast.success("Aktivität freigegeben");
    },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activities"] });
      toast.success("Aktivität gelöscht");
    },
    onError: (e) => toast.error(`Fehler: ${e.message}`),
  });

  const filtered = activities?.filter((a) =>
    showApproved ? a.is_approved : !a.is_approved
  );

  return (
    <div className="min-h-screen pb-8 bg-muted/30">
      <header className="px-5 pt-6 pb-4 flex items-center gap-3 bg-card border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display text-xl font-bold">Admin</h1>
          <p className="text-xs text-muted-foreground">Events verwalten</p>
        </div>
      </header>

      <div className="px-5 py-4 space-y-4">
        <div className="flex gap-2">
          <Button
            variant={!showApproved ? "default" : "outline"}
            size="sm"
            className="rounded-full gap-1.5"
            onClick={() => setShowApproved(false)}
          >
            <EyeOff className="w-3.5 h-3.5" />
            Ausstehend
          </Button>
          <Button
            variant={showApproved ? "default" : "outline"}
            size="sm"
            className="rounded-full gap-1.5"
            onClick={() => setShowApproved(true)}
          >
            <Eye className="w-3.5 h-3.5" />
            Freigegeben
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered && filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((activity) => (
              <div
                key={activity.id}
                className="bg-card rounded-2xl p-4 border border-border space-y-2"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-sm">
                      {activity.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.location_name} · {activity.district}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(activity.start_time), "dd. MMM yyyy HH:mm", { locale: de })}
                    </p>
                  </div>
                  <Badge variant={activity.is_approved ? "default" : "secondary"}>
                    {activity.is_approved ? "Live" : "Ausstehend"}
                  </Badge>
                </div>

                {activity.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {activity.description}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  {!activity.is_approved && (
                    <Button
                      size="sm"
                      className="rounded-full gap-1.5"
                      onClick={() => approveMutation.mutate(activity.id)}
                      disabled={approveMutation.isPending}
                    >
                      <Check className="w-3.5 h-3.5" />
                      Freigeben
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate(activity.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Löschen
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title={showApproved ? "Keine freigegebenen Events" : "Keine ausstehenden Events"}
            description={
              showApproved
                ? "Freigegebene Events erscheinen hier"
                : "Importierte Events werden hier zur Überprüfung angezeigt"
            }
          />
        )}
      </div>
    </div>
  );
};

export default Admin;
