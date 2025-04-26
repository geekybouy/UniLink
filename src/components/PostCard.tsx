
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface Comment {
  author: string;
  text: string;
}

interface Author {
  name: string;
  avatar: string;
  batchYear: string;
}

interface Post {
  id: number;
  author: Author;
  timestamp: string;
  content: string;
  likes: number;
  comments: Comment[];
}

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(prev => liked ? prev - 1 : prev + 1);
  };

  return (
    <Card className="p-4">
      {/* Post Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.author.name}</p>
            <p className="text-sm text-muted-foreground">Class of {post.author.batchYear}</p>
          </div>
        </div>
        <span className="text-sm text-muted-foreground">{post.timestamp}</span>
      </div>

      {/* Post Content */}
      <p className="mb-4">{post.content}</p>

      <Separator className="my-3" />

      {/* Interaction Buttons */}
      <div className="flex items-center gap-6">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2"
          onClick={handleLike}
        >
          <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
          <span>{likeCount}</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span>{post.comments.length}</span>
        </Button>
        <Button variant="ghost" size="sm">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Comments Preview */}
      {post.comments.length > 0 && (
        <div className="mt-3 pl-2 border-l-2 border-muted">
          {post.comments[0] && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{post.comments[0].author}:</span> {post.comments[0].text}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};

export default PostCard;
