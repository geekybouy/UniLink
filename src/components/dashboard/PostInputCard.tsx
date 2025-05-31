
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PostInputCard = () => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return toast.error("Post can't be empty");
    if (!user) return toast.error("Please login to post.");

    setIsPosting(true);
    const { error } = await supabase
      .from("posts")
      .insert({ user_id: user.id, content });

    setIsPosting(false);

    if (error) {
      toast.error("Could not create post.");
    } else {
      setContent("");
      toast.success("Post created!");
      window.dispatchEvent(new Event("reload-posts")); // Let AlumniFeed know
    }
  };

  return (
    <form onSubmit={handlePost} className="bg-white rounded-xl border px-4 py-3 mb-3 flex items-center gap-3 shadow-sm">
      <Input
        placeholder="Post something..."
        value={content}
        onChange={e => setContent(e.target.value)}
        className="flex-1 bg-background"
        disabled={isPosting}
        aria-label="Post something"
      />
      <Button type="submit" disabled={isPosting || !content.trim()} size="sm">
        {isPosting ? "Posting..." : "Post"}
      </Button>
    </form>
  );
};

export default PostInputCard;
