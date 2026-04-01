import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "rausmi-bookmarks";

export function useBookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // Sync from DB when user logs in
  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_bookmarks")
      .select("activity_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (data) {
          const dbIds = new Set(data.map((b) => b.activity_id));
          const localIds = (() => {
            try {
              const stored = localStorage.getItem(STORAGE_KEY);
              return stored ? (JSON.parse(stored) as string[]) : [];
            } catch {
              return [];
            }
          })();
          const toInsert = localIds.filter((id) => !dbIds.has(id));
          if (toInsert.length > 0) {
            supabase
              .from("user_bookmarks")
              .insert(toInsert.map((id) => ({ user_id: user.id, activity_id: id })))
              .then(() => localStorage.removeItem(STORAGE_KEY));
            toInsert.forEach((id) => dbIds.add(id));
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
          setBookmarks(dbIds);
        }
      });
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmarks]));
    }
  }, [bookmarks, user]);

  const toggle = useCallback(
    async (id: string) => {
      if (!user) {
        setShowAuthDialog(true);
        return;
      }
      const has = bookmarks.has(id);
      setBookmarks((prev) => {
        const next = new Set(prev);
        if (has) next.delete(id);
        else next.add(id);
        return next;
      });
      if (has) {
        await supabase.from("user_bookmarks").delete().eq("user_id", user.id).eq("activity_id", id);
      } else {
        await supabase.from("user_bookmarks").insert({ user_id: user.id, activity_id: id });
      }
    },
    [user, bookmarks]
  );

  const isBookmarked = useCallback((id: string) => bookmarks.has(id), [bookmarks]);

  return { toggle, isBookmarked, showAuthDialog, setShowAuthDialog };
}
