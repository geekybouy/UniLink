import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Post } from '@/types/knowledge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

const ContentModeration = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
        *,
        user:user_id (
          id
        ),
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Transform the data to match the Post interface
        const transformedPosts: Post[] = data.map(post => {
          return {
            id: post.id,
            title: post.title || '',
            content: post.content || '',
            created_at: post.created_at || new Date().toISOString(),
            user_id: post.user_id || '',
            // Safely handle user data
            user: post.profiles ? {
              full_name: post.profiles.full_name || 'Unknown User',
              avatar_url: post.profiles.avatar_url || null
            } : {
              full_name: 'Unknown User',
              avatar_url: null
            },
            // Add default values for fields that might not exist in the database
            content_type: 'article',
            file_url: post.image_url || null,
            is_approved: post.is_approved || false,
            is_featured: post.is_featured || false,
          };
        });

        setPosts(transformedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (postId: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_approved: true })
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.map(post =>
        post.id === postId ? { ...post, is_approved: true } : post
      ));
      toast({
        title: "Post Approved",
        description: "The post has been successfully approved.",
      })
    } catch (error) {
      console.error('Error approving post:', error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Failed to approve the post. Please try again.",
      })
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeature = async (postId: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_featured: true })
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.map(post =>
        post.id === postId ? { ...post, is_featured: true } : post
      ));
      toast({
        title: "Post Featured",
        description: "The post has been successfully featured.",
      })
    } catch (error) {
      console.error('Error featuring post:', error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Failed to feature the post. Please try again.",
      })
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: string) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post.id !== postId));
      toast({
        title: "Post Deleted",
        description: "The post has been successfully deleted.",
      })
    } catch (error) {
      console.error('Error deleting post:', error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Failed to delete the post. Please try again.",
      })
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Content Moderation</h1>
      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.user?.full_name}</TableCell>
                  <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{post.is_approved ? 'Approved' : 'Pending'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedPost(post);
                        setIsDialogOpen(true);
                      }}
                    >
                      View
                    </Button>
                    {!post.is_approved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(post.id)}
                        disabled={isSubmitting}
                      >
                        Approve
                      </Button>
                    )}
                    {!post.is_featured && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleFeature(post.id)}
                        disabled={isSubmitting}
                      >
                        Feature
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(post.id)}
                      disabled={isSubmitting}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
            <DialogDescription>
              View and manage the details of the selected post.
            </DialogDescription>
          </DialogHeader>
          {selectedPost && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  type="text"
                  id="title"
                  value={selectedPost.title}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right">
                  Content
                </Label>
                <Input
                  type="text"
                  id="content"
                  value={selectedPost.content}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="author" className="text-right">
                  Author
                </Label>
                <Input
                  type="text"
                  id="author"
                  value={selectedPost.user?.full_name || 'Unknown'}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="createdAt" className="text-right">
                  Created At
                </Label>
                <Input
                  type="text"
                  id="createdAt"
                  value={new Date(selectedPost.created_at).toLocaleDateString()}
                  className="col-span-3"
                  readOnly
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <Input
                  type="text"
                  id="status"
                  value={selectedPost.is_approved ? 'Approved' : 'Pending'}
                  className="col-span-3"
                  readOnly
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentModeration;
