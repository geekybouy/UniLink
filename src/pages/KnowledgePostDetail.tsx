
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { KnowledgeProvider, useKnowledge } from '@/contexts/KnowledgeContext';
import MainLayout from '@/layouts/MainLayout';
import CommentSection from '@/components/knowledge/CommentSection';
import { Post } from '@/types/knowledge';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import {
  ThumbsUp,
  Bookmark,
  BookmarkCheck,
  Share2,
  ArrowLeft,
  FileText,
  Link2,
  Image,
  File,
  Pencil,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const PostDetailContent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { fetchPostById, upvotePost, removeVote, bookmarkPost, removeBookmark, deletePost } = useKnowledge();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    loadPost();
  }, [id]);
  
  const loadPost = async () => {
    if (!id) return;
    
    setIsLoading(true);
    const fetchedPost = await fetchPostById(id);
    setPost(fetchedPost);
    setIsLoading(false);
  };
  
  const handleVote = async () => {
    if (!user || !post) return;
    
    if (post.user_has_voted) {
      await removeVote(post.id);
    } else {
      await upvotePost(post.id);
    }
    
    // Reload post to get updated counts
    loadPost();
  };
  
  const handleBookmark = async () => {
    if (!user || !post) return;
    
    if (post.user_has_bookmarked) {
      await removeBookmark(post.id);
    } else {
      await bookmarkPost(post.id);
    }
    
    // Reload post to get updated counts
    loadPost();
  };
  
  const handleDelete = async () => {
    if (!post) return;
    
    const success = await deletePost(post.id);
    if (success) {
      toast.success('Post deleted successfully');
      navigate('/knowledge');
    }
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };
  
  const getContentTypeIcon = () => {
    if (!post) return <FileText className="h-4 w-4" />;
    
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
  
  const isOwner = user && post?.user_id === user.id;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner />
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold mb-2">Post Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The post you are looking for might have been removed or doesn't exist.
        </p>
        <Button asChild>
          <Link to="/knowledge">Back to Knowledge Hub</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-6 max-w-4xl">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm"
          asChild
          className="mb-4"
        >
          <Link to="/knowledge" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Knowledge Hub
          </Link>
        </Button>
        
        {/* Post Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.user?.avatar_url || undefined} />
              <AvatarFallback>{post.user?.full_name.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            
            <div>
              <div className="font-medium">{post.user?.full_name || 'Unknown User'}</div>
              <div className="text-sm text-muted-foreground">
                Posted on {format(new Date(post.created_at), 'MMMM d, yyyy')}
              </div>
            </div>
          </div>
          
          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Post
                </DropdownMenuItem>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        Delete Post
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your post
                        and remove all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {/* Post Title and Tags */}
        <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
        
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Badge variant="outline" className="flex items-center gap-1">
            {getContentTypeIcon()}
            {post.content_type.charAt(0).toUpperCase() + post.content_type.slice(1)}
          </Badge>
          
          {post.is_featured && (
            <Badge className="bg-yellow-600 hover:bg-yellow-700">
              Featured
            </Badge>
          )}
          
          {post.tags && post.tags.map(tag => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
        
        {/* Post Content */}
        <div className="prose prose-sm sm:prose max-w-none mb-8">
          {post.content_type === 'article' && post.content && (
            <div className="whitespace-pre-wrap">{post.content}</div>
          )}
          
          {post.content_type === 'link' && post.link_url && (
            <div>
              <p className="mb-4">{post.content}</p>
              <a 
                href={post.link_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Link2 className="h-4 w-4" />
                {post.link_url}
              </a>
            </div>
          )}
          
          {post.content_type === 'image' && post.file_url && (
            <div className="space-y-4">
              {post.content && <p>{post.content}</p>}
              <img 
                src={post.file_url} 
                alt={post.title} 
                className="max-w-full rounded-md"
              />
            </div>
          )}
          
          {post.content_type === 'file' && post.file_url && (
            <div className="space-y-4">
              {post.content && <p>{post.content}</p>}
              <a 
                href={post.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md"
              >
                <File className="h-4 w-4" />
                Download File
              </a>
            </div>
          )}
        </div>
        
        {/* Post Actions */}
        <div className="flex items-center gap-4 mb-8 pt-2 border-t">
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
            {post.votes_count || 0} Upvotes
          </Button>
          
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
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleShare}
            className="flex items-center gap-1"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>
        
        {/* Comments Section */}
        <div className="border-t pt-6">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
};

const KnowledgePostDetail: React.FC = () => {
  return (
    <MainLayout>
      <KnowledgeProvider>
        <PostDetailContent />
      </KnowledgeProvider>
    </MainLayout>
  );
};

export default KnowledgePostDetail;
