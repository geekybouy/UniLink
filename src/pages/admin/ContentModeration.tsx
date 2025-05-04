import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Check, X, Eye, MessageSquare, ThumbsUp } from 'lucide-react';
import { Post, Tag } from '@/types/knowledge';

const ContentModeration = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentFilter, setContentFilter] = useState<'all' | 'reported' | 'featured'>('all');
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchContent();
  }, []);
  
  const fetchContent = async () => {
    setLoading(true);
    try {
      // Fetch all posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id, title, content, created_at, user_id, image_url,
          user:profiles (full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });
      
      if (postsError) throw postsError;
      
      // Fetch all comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles (full_name, avatar_url),
          post:posts (title)
        `)
        .order('created_at', { ascending: false });
      
      if (commentsError) throw commentsError;
      
      // Format posts and separate pending approval
      if (postsData) {
        // Transform data to match Post type
        const formattedPosts: Post[] = postsData.map(post => ({
          id: post.id,
          title: post.title || 'Untitled Post',
          content: post.content,
          created_at: post.created_at,
          user_id: post.user_id,
          user: post.user,
          image_url: post.image_url,
          content_type: 'article',
          is_approved: Math.random() > 0.3, // Mock data for demonstration
          is_featured: Math.random() > 0.7, // Mock data for demonstration
          votes_count: Math.floor(Math.random() * 50),
          comments_count: Math.floor(Math.random() * 10)
        }));
        
        const pending = formattedPosts.filter(post => post.is_approved === false);
        const approved = formattedPosts.filter(post => post.is_approved !== false);
        
        setPosts(approved);
        setPendingPosts(pending);
      }
      
      setComments(commentsData || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to fetch content');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handleContentFilterChange = (value: string) => {
    setContentFilter(value as 'all' | 'reported' | 'featured');
  };
  
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content?.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (contentFilter === 'featured') {
      return matchesSearch && post.is_featured === true;
    } else if (contentFilter === 'reported') {
      // In a real app, you would have a reports table to filter reported content
      return matchesSearch; 
    }
    
    return matchesSearch;
  });
  
  const handlePreviewPost = (post: Post) => {
    setCurrentPost(post);
    setIsPreviewDialogOpen(true);
  };
  
  const handleFeaturePost = async (postId: string, isFeatured: boolean) => {
    try {
      // In a real app, you would update the is_featured field in the database
      // For now, we'll update the local state
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, is_featured: isFeatured } : post
      ));
      
      toast.success(`Post ${isFeatured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      console.error('Error updating post feature status:', error);
      toast.error('Failed to update post');
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);
        
        if (error) throw error;
        
        toast.success('Post deleted successfully');
        
        // Remove post from local state
        setPosts(posts.filter(post => post.id !== postId));
        setPendingPosts(pendingPosts.filter(post => post.id !== postId));
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
      }
    }
  };
  
  const handleApprovePost = async (postId: string) => {
    try {
      // In a real app, you would update the is_approved field in the database
      // For now, we'll update the local state
      const approvedPost = pendingPosts.find(post => post.id === postId);
      if (approvedPost) {
        setPosts([{ ...approvedPost, is_approved: true }, ...posts]);
        setPendingPosts(pendingPosts.filter(post => post.id !== postId));
      }
      
      toast.success('Post approved successfully');
    } catch (error) {
      console.error('Error approving post:', error);
      toast.error('Failed to approve post');
    }
  };
  
  const handleRejectDialogOpen = (post: Post) => {
    setCurrentPost(post);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };
  
  const handleRejectPost = async () => {
    if (!currentPost) return;
    
    try {
      // In a real app, you might want to store the rejection reason
      // and notify the user about the rejected content
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', currentPost.id);
      
      if (error) throw error;
      
      toast.success('Post rejected and removed');
      
      // Remove post from local state
      setPendingPosts(pendingPosts.filter(post => post.id !== currentPost.id));
      setIsRejectDialogOpen(false);
    } catch (error) {
      console.error('Error rejecting post:', error);
      toast.error('Failed to reject post');
    }
  };
  
  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('comments')
          .delete()
          .eq('id', commentId);
        
        if (error) throw error;
        
        toast.success('Comment deleted successfully');
        
        // Remove comment from local state
        setComments(comments.filter(comment => comment.id !== commentId));
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast.error('Failed to delete comment');
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Loading content...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Content Moderation</h1>
      
      <Tabs defaultValue="pending" className="mb-6">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approval ({pendingPosts.length})
          </TabsTrigger>
          <TabsTrigger value="posts">
            Posts ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="comments">
            Comments ({comments.length})
          </TabsTrigger>
        </TabsList>
        
        <div className="flex items-center justify-between my-4">
          <div className="flex gap-2 items-center">
            <Input 
              placeholder="Search content..." 
              value={searchQuery} 
              onChange={handleSearch} 
              className="w-64"
            />
            
            {/* Only show filter for the posts tab */}
            <TabsContent value="posts" className="mt-0">
              <Select value={contentFilter} onValueChange={handleContentFilterChange}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Content</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="reported">Reported</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>
          </div>
        </div>
        
        {/* Pending Approval Tab */}
        <TabsContent value="pending">
          {pendingPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPosts.map(post => (
                <Card key={post.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                    <CardDescription>
                      By {post.user?.full_name} • {new Date(post.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="line-clamp-4 text-sm">
                      {post.content}
                    </p>
                    <div className="mt-2">
                      {post.tags?.map((tag: Tag) => (
                        <Badge key={tag.id} variant="outline" className="mr-1 mb-1">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="space-x-2 flex justify-between">
                    <Button size="sm" variant="outline" onClick={() => handlePreviewPost(post)}>
                      <Eye className="h-4 w-4 mr-1" /> Preview
                    </Button>
                    <div>
                      <Button size="sm" variant="destructive" onClick={() => handleRejectDialogOpen(post)} className="mr-2">
                        <X className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button size="sm" variant="default" onClick={() => handleApprovePost(post.id)}>
                        <Check className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border rounded-lg bg-muted/20">
              <p>No content pending approval.</p>
            </div>
          )}
        </TabsContent>
        
        {/* Posts Tab */}
        <TabsContent value="posts">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length > 0 ? filteredPosts.map(post => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.user?.full_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{post.content_type || 'article'}</Badge>
                  </TableCell>
                  <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {post.is_featured ? (
                      <Badge variant="secondary">Featured</Badge>
                    ) : (
                      <Badge variant="outline">Standard</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handlePreviewPost(post)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    <Button 
                      size="sm" 
                      variant={post.is_featured ? "secondary" : "outline"} 
                      onClick={() => handleFeaturePost(post.id, !post.is_featured)}
                    >
                      {post.is_featured ? 'Unfeature' : 'Feature'}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <X className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    No posts found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
        
        {/* Comments Tab */}
        <TabsContent value="comments">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comment</TableHead>
                <TableHead>User</TableHead>
                <TableHead>On Post</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comments.length > 0 ? comments.map(comment => (
                <TableRow key={comment.id}>
                  <TableCell className="max-w-md">
                    <div className="truncate">{comment.content}</div>
                  </TableCell>
                  <TableCell>{comment.user?.full_name}</TableCell>
                  <TableCell>{comment.post?.title}</TableCell>
                  <TableCell>{new Date(comment.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <X className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    No comments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
      
      {/* Post Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentPost?.title}</DialogTitle>
            <DialogDescription>
              By {currentPost?.user?.full_name} • {currentPost && new Date(currentPost.created_at).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {currentPost?.content_type === 'image' && currentPost?.file_url && (
              <div className="flex justify-center">
                <img 
                  src={currentPost.file_url} 
                  alt={currentPost.title}
                  className="max-h-96 object-contain rounded-md"
                />
              </div>
            )}
            
            <div className="whitespace-pre-wrap">
              {currentPost?.content}
            </div>
            
            {currentPost?.link_url && (
              <div className="mt-4">
                <a 
                  href={currentPost.link_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {currentPost.link_url}
                </a>
              </div>
            )}
            
            <div className="flex gap-2 items-center mt-4">
              <div className="flex items-center text-muted-foreground">
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span>{currentPost?.votes_count || 0} votes</span>
              </div>
              <div className="flex items-center text-muted-foreground ml-4">
                <MessageSquare className="h-4 w-4 mr-1" />
                <span>{currentPost?.comments_count || 0} comments</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Content</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this content. This will be sent to the user.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <Textarea
              placeholder="Reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleRejectPost}
              disabled={!rejectionReason.trim()}
            >
              Reject Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentModeration;
