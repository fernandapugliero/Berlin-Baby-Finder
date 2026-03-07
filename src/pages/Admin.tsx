import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fetchAllActivities, approveActivity, deleteActivity } from "@/lib/activity-queries";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showApproved, setShowApproved] = useState(false);

  const { data: activities, isLoading } = useQuery({
    queryKey: ["admin-activities"],
    queryFn: fetchAllActivities,
  });

  const approveMutation = useMutation({
    mutationFn: approveActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activities"] });
      toast.success("Activity approved");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activities"] });
      toast.success("Activity deleted");
    },
    onError: (e) => toast.error(`Failed: ${e.message}`),
  });

  const filtered = activities?.filter((a) =>
    showApproved ? a.is_approved : !a.is_approved
  );

  return (
    <div className="min-h-screen pb-8">
      <header className="px-4 pt-6 pb-4 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-display text-xl font-bold">Admin Panel</h1>
          <p className="text-xs text-muted-foreground">Review imported events</p>
        </div>
      </header>

      <div className="px-4 space-y-4">
        <div className="flex gap-2">
          <Button
            variant={!showApproved ? "default" : "outline"}
            size="sm"
            className="rounded-full gap-1.5"
            onClick={() => setShowApproved(false)}
          >
            <EyeOff className="w-3.5 h-3.5" />
            Pending
          </Button>
          <Button
            variant={showApproved ? "default" : "outline"}
            size="sm"
            className="rounded-full gap-1.5"
            onClick={() => setShowApproved(true)}
          >
            <Eye className="w-3.5 h-3.5" />
            Approved
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
                      {format(new Date(activity.start_time), "dd MMM yyyy HH:mm")}
                    </p>
                  </div>
                  <Badge variant={activity.is_approved ? "default" : "secondary"}>
                    {activity.is_approved ? "Live" : "Pending"}
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
                      Approve
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
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title={showApproved ? "No approved events" : "No pending events"}
            description={
              showApproved
                ? "Approved events will appear here"
                : "Import events and they'll show up here for review"
            }
          />
        )}
      </div>
    </div>
  );
};

export default Admin;
