
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SocialLink {
  id?: string;
  platform: string;
  url: string;
}

export function useSocialLinks(userId: string | null | undefined) {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's social links
  useEffect(() => {
    if (!userId) {
      setLinks([]);
      return;
    }
    setLoading(true);

    // Use async/await to avoid chaining .catch or .finally on PromiseLike
    const fetchLinks = async () => {
      try {
        const { data, error } = await supabase
          .from("social_links")
          .select("*")
          .eq("user_id", userId);
        if (!error && data) {
          setLinks(
            data.map((l) => ({
              id: l.id,
              platform: l.platform || "",
              url: l.url || "",
            }))
          );
        }
        // else leave as-is; you could optionally handle error (e.g. setLinks([]))
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [userId]);

  // Saves all social links: clears old links then inserts new ones
  const saveLinks = async (socialLinks: SocialLink[]) => {
    if (!userId) return;
    setLoading(true);
    // 1. Delete old links
    await supabase.from("social_links").delete().eq("user_id", userId);
    // 2. Insert all new/current links (filter out incomplete ones)
    const filtered = socialLinks
      .map((s) => ({
        platform: s.platform.trim(),
        url: s.url.trim(),
        user_id: userId,
      }))
      .filter((l) => l.platform && l.url);
    if (filtered.length > 0) {
      await supabase.from("social_links").insert(filtered);
    }
    setLinks(filtered);
    setLoading(false);
  };

  return { links, setLinks, saveLinks, loading };
}
