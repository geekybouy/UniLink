
// Fix profile handling in ContentModeration.tsx

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
