
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Bookmark, Share2, Repeat2, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

type AlumniPost = {
  id: string;
  user_id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  username?: string;
  verified?: boolean;
  user?: {
    full_name?: string;
    username?: string;
    graduation_year?: number;
    avatar_url?: string | null;
    verified?: boolean;
  } | null;
};

interface PostCardProps {
  post: AlumniPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const name = post.user?.full_name || "Alumnus";
  const username = post.user?.username || post.user_id?.slice(0, 5) || "user";
  const avatar = post.user?.avatar_url || undefined;
  const isVerified = !!post.user?.verified;
  const timestamp = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  return (
    <div className="bg-card rounded-xl border px-4 py-3 shadow-sm flex flex-col gap-2 transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {avatar ? (
              <AvatarImage src={avatar} alt={name || undefined} />
            ) : (
              <AvatarFallback>{name?.[0] ?? "A"}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-[1rem]">{name}</span>
              {isVerified && (
                // Removed title prop – Lucide icons do not support 'title'
                <BadgeCheck className="h-4 w-4 text-blue-500 dark:text-blue-400" />
              )}
            </div>
            <div className="text-xs text-muted-foreground flex gap-2">
              @{username}
              <span>·</span>
              {timestamp}
            </div>
          </div>
        </div>
        {/* Optionally, add menu dropdown for each post */}
      </div>
      {post.content && (
        <div className="pl-1 text-base break-words">{post.content}</div>
      )}
      {post.image_url && (
        <div className="mt-1 rounded-lg overflow-hidden max-h-96">
          <img src={post.image_url} alt="Post attachment" className="w-full object-cover" />
        </div>
      )}
      <div className="flex justify-between items-center pt-1 px-1">
        <Button variant="ghost" size="sm" className="flex gap-1 hover:bg-accent" tabIndex={0} aria-label="Like">
          <Heart className="h-5 w-5" />
          <span className="text-sm">0</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex gap-1 hover:bg-accent" tabIndex={0} aria-label="Comment">
          <MessageSquare className="h-5 w-5" />
          <span className="text-sm">0</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex gap-1 hover:bg-accent" tabIndex={0} aria-label="Repost">
          <Repeat2 className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm" className="flex gap-1 hover:bg-accent" tabIndex={0} aria-label="Bookmark">
          <Bookmark className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="sm" className="hover:bg-accent" tabIndex={0} aria-label="Share">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default PostCard;
