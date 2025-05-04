
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/layouts/AdminLayout';

const ContentModeration = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ 
          status: 'approved' 
        })
        .eq('id', postId);

      if (error) {
        throw error;
      }

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, status: 'approved' } : post
        )
      );
      
      toast({
        title: 'Success',
        description: 'Post approved successfully',
      });
    } catch (error) {
      console.error('Error approving post:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve post',
        variant: 'destructive',
      });
    }
  };

  const handleRejectPost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ 
          status: 'rejected' 
        })
        .eq('id', postId);

      if (error) {
        throw error;
      }

      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, status: 'rejected' } : post
        )
      );
      
      toast({
        title: 'Success',
        description: 'Post rejected successfully',
      });
    } catch (error) {
      console.error('Error rejecting post:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject post',
        variant: 'destructive',
      });
    }
  };

  const content = (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Content Moderation</h1>
      
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4">Loading content...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {posts.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No posts to review</p>
            </div>
          ) : (
            posts.map((post) => (
              <Card key={post.id} className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {post.profiles?.avatar_url ? (
                        <img src={post.profiles.avatar_url} alt="User avatar" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xl font-semibold">{post.profiles?.full_name?.[0] || '?'}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{post.profiles?.full_name || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(post.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 hover:bg-green-500 hover:text-white"
                          onClick={() => handleApprovePost(post.id)}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 hover:bg-red-500 hover:text-white"
                          onClick={() => handleRejectPost(post.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm">{post.content}</p>
                      {post.image_url && (
                        <div className="mt-2 max-h-60 overflow-hidden rounded">
                          <img src={post.image_url} alt="Post image" className="w-full object-cover" />
                        </div>
                      )}
                    </div>
                    {post.status && (
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          post.status === 'approved' ? 'bg-green-100 text-green-700' :
                          post.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {post.status?.charAt(0).toUpperCase() + post.status?.slice(1)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );

  return <AdminLayout>{content}</AdminLayout>;
};

export default ContentModeration;
