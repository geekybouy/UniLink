
import React from 'react';
import { useKnowledge } from '@/contexts/KnowledgeContext';
import { Post } from '@/types/knowledge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { FileText, Link2, Image, File, Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const FeaturedContent: React.FC = () => {
  const { featuredPosts, isLoading } = useKnowledge();

  const getContentTypeIcon = (type: string) => {
    switch (type) {
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

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  }

  if (featuredPosts.length === 0) {
    return (
      <Card className="bg-muted/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Content
          </CardTitle>
          <CardDescription>
            No featured content available at this time.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-muted/30 to-background">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Featured Content
        </CardTitle>
        <CardDescription>
          Highlighted content selected by our community
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {featuredPosts.slice(0, 3).map((post) => (
          <div key={post.id} className="flex gap-3">
            {post.content_type === 'image' && post.file_url ? (
              <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                <img 
                  src={post.file_url} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 bg-primary/10 rounded flex items-center justify-center flex-shrink-0">
                {getContentTypeIcon(post.content_type)}
              </div>
            )}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={post.user?.avatar_url || undefined} />
                  <AvatarFallback>{post.user?.full_name.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{post.user?.full_name}</span>
              </div>
              
              <Link to={`/knowledge/${post.id}`} className="hover:underline">
                <h4 className="font-medium line-clamp-2">{post.title}</h4>
              </Link>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  {getContentTypeIcon(post.content_type)}
                  {post.content_type.charAt(0).toUpperCase() + post.content_type.slice(1)}
                </Badge>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ThumbsUp className="h-3 w-3" />
                  {post.votes_count || 0}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  {post.comments_count || 0}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      {featuredPosts.length > 3 && (
        <CardFooter>
          <Button asChild variant="ghost" size="sm" className="w-full">
            <Link to="/knowledge?featured=true">
              View All Featured Content
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default FeaturedContent;
