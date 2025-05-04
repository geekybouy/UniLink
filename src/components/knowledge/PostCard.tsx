
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Post } from '@/types/knowledge';
import { useKnowledge } from '@/contexts/KnowledgeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ThumbsUp,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  FileText,
  Link2,
  Image,
  File,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: Post;
  showFullContent?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, showFullContent = false }) => {
  const { upvotePost, removeVote, bookmarkPost, removeBookmark } = useKnowledge();
  const { user } = useAuth();

  const getContentTypeIcon = () => {
    switch (post.content_type) {
      case 'article':
        return <FileText className="h-4 w-4" />;
      case 'link':
        return <Link2 className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      case 'file':
        return <File className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleVote = async () => {
    if (!user) return;
    
    if (post.user_has_voted) {
      await removeVote(post.id);
    } else {
      await upvotePost(post.id);
    }
  };

  const handleBookmark = async () => {
    if (!user) return;
    
    if (post.user_has_bookmarked) {
      await removeBookmark(post.id);
    } else {
      await bookmarkPost(post.id);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.user?.avatar_url || undefined} />
              <AvatarFallback>{post.user?.full_name.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{post.user?.full_name || 'Unknown User'}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(post.created_at), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              {getContentTypeIcon()}
              {post.content_type.charAt(0).toUpperCase() + post.content_type.slice(1)}
            </Badge>
            {post.is_featured && (
              <Badge className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-1">
                <Star className="h-3 w-3" />
                Featured
              </Badge>
            )}
          </div>
        </div>
        <Link to={`/knowledge/${post.id}`} className="hover:underline">
          <CardTitle className="text-xl mt-2">{post.title}</CardTitle>
        </Link>
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {post.tags.map(tag => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Content preview */}
        {post.content_type === 'article' && (
          <div className={cn("prose prose-sm max-w-none", {"line-clamp-3": !showFullContent})}>
            <p>{post.content}</p>
          </div>
        )}
        
        {post.content_type === 'link' && (
          <a 
            href={post.link_url || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
          >
            <Link2 className="h-4 w-4" />
            {post.link_url}
          </a>
        )}
        
        {post.content_type === 'image' && post.file_url && (
          <div className="mt-2">
            <img 
              src={post.file_url} 
              alt={post.title} 
              className="rounded-md max-h-64 object-cover"
            />
          </div>
        )}
        
        {post.content_type === 'file' && post.file_url && (
          <a 
            href={post.file_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-muted hover:bg-muted/80 text-sm px-3 py-2 rounded-md mt-2"
          >
            <File className="h-4 w-4" />
            Download File
          </a>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={handleVote}
            disabled={!user}
          >
            <ThumbsUp 
              className={cn("h-4 w-4", {
                "fill-primary text-primary": post.user_has_voted
              })} 
            />
            {post.votes_count || 0}
          </Button>
          
          <Link to={`/knowledge/${post.id}`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {post.comments_count || 0}
            </Button>
          </Link>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleBookmark}
          disabled={!user}
          className="flex items-center gap-1"
        >
          {post.user_has_bookmarked ? (
            <BookmarkCheck className="h-4 w-4 fill-primary text-primary" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
          {post.user_has_bookmarked ? 'Saved' : 'Save'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
