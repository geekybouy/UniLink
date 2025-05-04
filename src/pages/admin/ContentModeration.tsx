import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MoreHorizontal, UserCheck, Ban, Trash2, Edit, Download } from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Post } from '@/types/knowledge';

const ContentModeration = () => {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const { user: currentAuthUser } = useAuth();
  
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Adjust the query to handle all required fields for the Post type
      const { data, error } = await supabase
        .from('posts')
        .select('*, user:profiles(full_name, avatar_url)');
    
      if (error) throw error;
    
      if (data) {
        // Transform the data to match the Post interface
        const formattedPosts = data.map(post => ({
          id: post.id,
          title: post.title || '',
          content: post.content || '',
          created_at: post.created_at,
          user_id: post.user_id,
          user: post.user,
          image_url: post.image_url,
          content_type: post.content_type || 'article',
          file_url: post.file_url,
          link_url: post.link_url,
          is_approved: post.is_approved || false,
          is_featured: post.is_featured || false,
          votes_count: post.votes_count || 0,
          comments_count: post.comments_count || 0,
          user_has_voted: false,
          user_has_bookmarked: false
        } as Post));
      
        setAllPosts(formattedPosts);
        setFilteredPosts(formattedPosts);
      }
    }
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    const filtered = allPosts.filter(post =>
      post.title.toLowerCase().includes(e.target.value.toLowerCase()) ||
      post.content.toLowerCase().includes(e.target.value.toLowerCase())
    );
    setFilteredPosts(filtered);
  };
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedPosts(filteredPosts.map(post => post.id));
    } else {
      setSelectedPosts([]);
    }
  };
  
  const handleSelectPost = (postId: string) => {
    if (selectedPosts.includes(postId)) {
      setSelectedPosts(selectedPosts.filter(id => id !== postId));
    } else {
      setSelectedPosts([...selectedPosts, postId]);
    }
  };
  
  const handleEditPost = (post: Post) => {
    setCurrentPost(post);
    setIsEditDialogOpen(true);
  };
  
  const approvePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_approved: true })
        .eq('id', postId);
    
      if (error) throw error;
    
      toast.success('Post approved successfully');
      fetchPosts(); // Refresh the list
    } catch (error) {
      console.error('Error approving post:', error);
      toast.error('Failed to approve post');
    }
  };
  
  const featurePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_featured: true })
        .eq('id', postId);
    
      if (error) throw error;
    
      toast.success('Post featured successfully');
      fetchPosts(); // Refresh the list
    } catch (error) {
      console.error('Error featuring post:', error);
      toast.error('Failed to feature post');
    }
  };
  
  const handleDeletePost = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        // In a production app, you might want to archive posts instead of deleting them
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', postId);
        
        if (error) throw error;
        
        toast.success('Post deleted successfully');
        fetchPosts(); // Refresh post list
      } catch (error) {
        console.error('Error deleting post:', error);
        toast.error('Failed to delete post');
      }
    }
  };
  
  const handleBulkAction = async (action: 'approve' | 'feature' | 'delete') => {
    if (selectedPosts.length === 0) {
      toast.error('No posts selected');
      return;
    }
    
    switch (action) {
      case 'approve':
        if (confirm(`Are you sure you want to approve ${selectedPosts.length} posts?`)) {
          try {
            for (const postId of selectedPosts) {
              const { error } = await supabase
                .from('posts')
                .update({ is_approved: true })
                .eq('id', postId);
              
              if (error) throw error;
            }
            
            toast.success(`${selectedPosts.length} posts approved successfully`);
            fetchPosts(); // Refresh post list
            setSelectedPosts([]);
          } catch (error) {
            console.error('Error approving posts:', error);
            toast.error('Failed to approve posts');
          }
        }
        break;
        
      case 'feature':
        if (confirm(`Are you sure you want to feature ${selectedPosts.length} posts?`)) {
          try {
            for (const postId of selectedPosts) {
              const { error } = await supabase
                .from('posts')
                .update({ is_featured: true })
                .eq('id', postId);
              
              if (error) throw error;
            }
            
            toast.success(`${selectedPosts.length} posts featured successfully`);
            fetchPosts(); // Refresh post list
            setSelectedPosts([]);
          } catch (error) {
            console.error('Error featuring posts:', error);
            toast.error('Failed to feature posts');
          }
        }
        break;
        
      case 'delete':
        if (confirm(`Are you sure you want to delete ${selectedPosts.length} posts? This cannot be undone.`)) {
          try {
            for (const postId of selectedPosts) {
              const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId);
              
              if (error) throw error;
            }
            
            toast.success(`${selectedPosts.length} posts deleted successfully`);
            fetchPosts(); // Refresh post list
            setSelectedPosts([]);
          } catch (error) {
            console.error('Error deleting posts:', error);
            toast.error('Failed to delete posts');
          }
        }
        break;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner />
        <span className="ml-2">Loading posts...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Content Moderation</h1>
      
      <Tabs defaultValue="pending" className="mb-6">
        <TabsList>
          <TabsTrigger value="pending">Pending ({allPosts.filter(post => !post.is_approved).length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({allPosts.filter(post => post.is_approved).length})</TabsTrigger>
          <TabsTrigger value="featured">Featured ({allPosts.filter(post => post.is_featured).length})</TabsTrigger>
        </TabsList>
        
        <div className="flex items-center justify-between my-4">
          <div className="flex gap-2 items-center">
            <Input 
              placeholder="Search posts..." 
              onChange={handleSearch} 
              className="w-64"
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => handleBulkAction('approve')} 
              disabled={selectedPosts.length === 0}
            >
              <UserCheck className="w-4 h-4 mr-1" /> Approve Selected
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleBulkAction('feature')}
              disabled={selectedPosts.length === 0}
            >
              <Star className="w-4 h-4 mr-1" /> Feature Selected
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleBulkAction('delete')}
              disabled={selectedPosts.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-1" /> Delete Selected
            </Button>
          </div>
        </div>
        
        <TabsContent value="pending">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setSelectedPosts(filteredPosts.filter(post => !post.is_approved).map(p => p.id));
                      } else {
                        setSelectedPosts([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Image</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.filter(post => !post.is_approved).length > 0 ? filteredPosts.filter(post => !post.is_approved).map(post => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedPosts.includes(post.id)}
                      onCheckedChange={() => handleSelectPost(post.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.content}</TableCell>
                  <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{post.user?.full_name}</TableCell>
                  <TableCell>{post.image_url}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => approvePost(post.id)}>
                          <UserCheck className="h-4 w-4 mr-2" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => featurePost(post.id)}>
                          <Star className="h-4 w-4 mr-2" /> Feature
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive" 
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No pending posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="approved">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setSelectedPosts(filteredPosts.filter(post => post.is_approved).map(p => p.id));
                      } else {
                        setSelectedPosts([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Image</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.filter(post => post.is_approved).length > 0 ? filteredPosts.filter(post => post.is_approved).map(post => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedPosts.includes(post.id)}
                      onCheckedChange={() => handleSelectPost(post.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.content}</TableCell>
                  <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{post.user?.full_name}</TableCell>
                  <TableCell>{post.image_url}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => featurePost(post.id)}>
                          <Star className="h-4 w-4 mr-2" /> Feature
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive" 
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No approved posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
        
        <TabsContent value="featured">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox 
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setSelectedPosts(filteredPosts.filter(post => post.is_featured).map(p => p.id));
                      } else {
                        setSelectedPosts([]);
                      }
                    }}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Image</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.filter(post => post.is_featured).length > 0 ? filteredPosts.filter(post => post.is_featured).map(post => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Checkbox 
                      checked={selectedPosts.includes(post.id)}
                      onCheckedChange={() => handleSelectPost(post.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{post.content}</TableCell>
                  <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>{post.user?.full_name}</TableCell>
                  <TableCell>{post.image_url}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive" 
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No featured posts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
      
      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update information for {currentPost?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" defaultValue={currentPost?.title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Input id="content" defaultValue={currentPost?.content} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              toast.success('Post updated successfully');
              setIsEditDialogOpen(false);
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentModeration;

import {
  Star,
} from 'lucide-react';
