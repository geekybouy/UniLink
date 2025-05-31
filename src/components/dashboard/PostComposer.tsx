
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Image, Smile } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function PostComposer() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Please sign in to post.");
    if (!content.trim() && !image) return toast.error("Cannot post empty content.");

    setIsPosting(true);

    // Handle image upload if any (basic, can be improved for prod)
    let imageUrl: string | null = null;
    if (image) {
      // You should adapt this block to use your own storage solution
      const { data, error } = await supabase.storage
        .from("public")
        .upload(`dashboard-posts/${user.id}-${Date.now()}-${image.name}`, image);
      if (error) {
        toast.error("Image upload failed");
        setIsPosting(false);
        return;
      }
      // Get public URL
      const { data: imgurl } = supabase.storage
        .from("public")
        .getPublicUrl(data.path);
      imageUrl = imgurl.publicUrl;
    }
    // Insert into posts table as text post (with optional image)
    const { error: postErr } = await supabase
      .from("posts")
      .insert({
        user_id: user.id,
        content: content.trim(),
        image_url: imageUrl,
      });
    setIsPosting(false);

    if (postErr) toast.error("Failed to post.");
    else {
      setContent("");
      setImage(null);
      toast.success("Posted!");
      window.dispatchEvent(new Event("reload-posts"));
    }
  };

  return (
    <Card className="mb-4 p-4 flex gap-3 items-start bg-background/95 shadow rounded-xl">
      <Avatar className="h-10 w-10">
        {user?.user_metadata?.avatar_url ? (
          <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name ?? "Profile"} />
        ) : (
          <AvatarFallback>{user?.user_metadata?.full_name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
        )}
      </Avatar>
      <form onSubmit={handleSubmit} className="flex-1">
        <Input
          className="w-full border-none px-3 bg-muted/40 focus:ring-0 rounded-full text-base"
          placeholder="What's happening?"
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={isPosting}
          aria-label="What's happening?"
        />
        {/* Optional: show selected image preview */}
        {image && (
          <div className="mt-2">
            <img src={URL.createObjectURL(image)} alt="preview" className="max-h-40 rounded-lg" />
          </div>
        )}
        <div className="flex gap-3 mt-2 items-center">
          <label className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-primary transition">
            <Image className="h-5 w-5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
              disabled={isPosting}
            />
            <span className="text-xs">Photo</span>
          </label>
          {/* Add more buttons (polls, emojis...) as you expand features */}
          <Button
            size="sm"
            className="ml-auto px-5 rounded-full"
            type="submit"
            disabled={isPosting || (!content.trim() && !image)}
          >
            {isPosting ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
