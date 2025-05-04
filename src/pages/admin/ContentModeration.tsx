
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Star, StarOff, FileText, FileImage, Link as LinkIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user_id: string;
  user: {
    full_name: string;
    avatar_url: string | null;
  };
  content_type: string;
  file_url: string | null;
  link_url: string | null;
  is_approved: boolean;
  is_featured: boolean;
}

const ContentModeration = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'rejected'>('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  // Update the fetch posts function to use profiles instead of user
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Transform data to match expected structure
        const formattedPosts = data.map(post => {
          return {
            id: post.id,
            title: post.title || '', // Handle new title field
            content: post.content || '',
            created_at: post.created_at || new Date().toISOString(),
            user_id: post.user_id || '',
            // Safely handle profiles data
            user: {
              full_name: post.profiles?.full_name || 'Unknown User',
              avatar_url: post.profiles?.avatar_url || null
            },
            // Add default values for fields
            content_type: post.content_type || 'article',
            file_url: post.file_url || post.image_url || null,
            link_url: post.link_url || null,
            is_approved: post.is_approved !== undefined ? post.is_approved : true,
            is_featured: post.is_featured !== undefined ? post.is_featured : false
          };
        });
        
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch posts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update the approve/reject function to handle the correct fields
  const updatePostApproval = async (postId: string, isApproved: boolean) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ 
          is_approved: isApproved 
        })
        .eq('id', postId);

      if (error) throw error;

      // Update local state
      setPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, is_approved: isApproved } : post
        )
      );

      toast({
        title: isApproved ? 'Post Approved' : 'Post Rejected',
        description: isApproved
          ? 'The post is now visible to users'
          : 'The post has been hidden from users',
      });
    } catch (error) {
      console.error('Error updating post approval status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post status',
        variant: 'destructive',
      });
    }
  };

  // Update the feature/unfeature function to handle the correct fields
  const updatePostFeatured = async (postId: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ 
          is_featured: isFeatured 
        })
        .eq('id', postId);

      if (error) throw error;

      // Update local state
      setPosts(prev =>
        prev.map(post =>
          post.id === postId ? { ...post, is_featured: isFeatured } : post
        )
      );

      toast({
        title: isFeatured ? 'Post Featured' : 'Post Unfeatured',
        description: isFeatured
          ? 'The post will now appear in featured sections'
          : 'The post has been removed from featured sections',
      });
    } catch (error) {
      console.error('Error updating post featured status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update post featured status',
        variant: 'destructive',
      });
    }
  };

  const filteredPosts = activeTab === 'all' 
    ? posts
    : activeTab === 'pending' 
      ? posts.filter(post => !post.is_approved)
      : posts.filter(post => post.is_approved === false);

  return (
    <AdminLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Content Moderation</CardTitle>
            <CardDescription>
              Manage and moderate user-submitted content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'pending' | 'rejected')}>
              <div className="mb-4">
                <TabsList className="grid w-full max-w-md grid-cols-3">
                  <TabsTrigger value="all">All Content</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="all" className="space-y-4">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center p-4">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Loading content...</p>
                    </div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="text-center p-8">
                      <p className="text-muted-foreground">No content found.</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[60vh]">
                      {filteredPosts.map((post) => (
                        <div key={post.id} className="p-4 border rounded-md mb-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={post.user?.avatar_url || ''} />
                                <AvatarFallback>{post.user?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium">{post.user?.full_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(post.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {post.content_type === 'article' && <Badge variant="outline"><FileText className="h-3 w-3 mr-1" /> Article</Badge>}
                              {post.content_type === 'image' && <Badge variant="outline"><FileImage className="h-3 w-3 mr-1" /> Image</Badge>}
                              {post.content_type === 'link' && <Badge variant="outline"><LinkIcon className="h-3 w-3 mr-1" /> Link</Badge>}
                              
                              <Badge variant={post.is_approved ? "default" : "destructive"}>
                                {post.is_approved ? 'Approved' : 'Rejected'}
                              </Badge>
                              
                              {post.is_featured && (
                                <Badge variant="secondary">
                                  <Star className="h-3 w-3 mr-1" /> Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-semibold">{post.title}</h3>
                          <p className="mt-2 mb-4 line-clamp-3">{post.content}</p>
                          
                          {post.file_url && (
                            <div className="mb-4">
                              <img 
                                src={post.file_url} 
                                alt="Post content" 
                                className="max-h-48 rounded-md object-cover" 
                              />
                            </div>
                          )}
                          
                          {post.link_url && (
                            <a 
                              href={post.link_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 mb-4"
                            >
                              <LinkIcon className="h-4 w-4" />
                              {post.link_url}
                            </a>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mt-4">
                            {post.is_approved ? (
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => updatePostApproval(post.id, false)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            ) : (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => updatePostApproval(post.id, true)}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            
                            {post.is_featured ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updatePostFeatured(post.id, false)}
                              >
                                <StarOff className="h-4 w-4 mr-1" />
                                Unfeature
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => updatePostFeatured(post.id, true)}
                              >
                                <Star className="h-4 w-4 mr-1" />
                                Feature
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="pending" className="space-y-4">
                {/* Same content as "all" but filtered for pending */}
                {isLoading ? (
                  <div className="text-center p-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading content...</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">No pending content.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[60vh]">
                    {/* Same rendering logic as above */}
                    {/* ... duplicate the post rendering from above but with filteredPosts */}
                  </ScrollArea>
                )}
              </TabsContent>
              
              <TabsContent value="rejected" className="space-y-4">
                {/* Same content as "all" but filtered for rejected */}
                {isLoading ? (
                  <div className="text-center p-4">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading content...</p>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground">No rejected content.</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[60vh]">
                    {/* Same rendering logic as above */}
                    {/* ... duplicate the post rendering from above but with filteredPosts */}
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ContentModeration;
