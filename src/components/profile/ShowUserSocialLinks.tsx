
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";

// Displays a user's social links.
// userId: the profile.user_id, which should be a uuid string.
export default function ShowUserSocialLinks({ userId }: { userId: string }) {
  const [links, setLinks] = useState<Array<{ platform: string; url: string }>>([]);

  useEffect(() => {
    if (!userId) return;
    let mounted = true;
    const fetchLinks = async () => {
      // The social_links table links user_id to each link
      const { data, error } = await supabase
        .from("social_links")
        .select("platform, url")
        .eq("user_id", userId);
      if (!error && Array.isArray(data) && mounted) {
        setLinks(data);
      }
    };
    fetchLinks();
    return () => { mounted = false; };
  }, [userId]);

  if (!links?.length)
    return <span className="ml-2 text-muted-foreground italic">No social links added.</span>;
  return (
    <ul className="ml-2 flex flex-wrap gap-2">
      {links.map((l, i) => (
        <li key={i}>
          <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium underline text-blue-600 hover:text-blue-800">
            {l.platform}
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </li>
      ))}
    </ul>
  );
}
