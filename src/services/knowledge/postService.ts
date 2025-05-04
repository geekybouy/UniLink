
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Post, Tag, ContentType, PostFormData } from '@/types/knowledge';
import { 
  hasNewPostsSchema, 
  processPost 
} from './dbSchemaService';
import { customSupabase } from '@/integrations/supabase/customClient';

// Check schema support when initializing
let schemaSupport = {
  hasChecked: false,
  hasNewSchema: false
};

const getSchemaSupport = async () => {
  if (!schemaSupport.hasChecked) {
    schemaSupport.hasNewSchema = await hasNewPostsSchema();
    schemaSupport.hasChecked = true;
  }
  return schemaSupport.hasNewSchema;
};

// Upload a file to Supabase storage
export const uploadFile = async (file: File): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('post_files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('post_files')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error: any) {
    toast.error('Error uploading file: ' + error.message);
    console.error('Error uploading file:', error);
    return null;
  }
};

// Fetch a post by ID
export const fetchPostById = async (id: string): Promise<Post | null> => {
  try {
    // Check if we have the new schema
    const hasNewSchema = await getSchemaSupport();

    // Use explicit type assertion to avoid excessive type instantiation
    const result = await supabase
      .from('posts')
      .select(`
        *,
        user:profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('id', id)
      .single();

    const { data, error } = result as unknown as {
      data: any;
      error: any;
    };

    if (error) throw error;

    // Fetch tags for the post
    const { data: tagData, error: tagError } = await supabase
      .from('post_tags')
      .select(`
        tag:tags (
          id,
          name
        )
      `)
      .eq('post_id', id);
    
    if (tagError) throw tagError;
    
    // Extract tags from the join result
    const tags = tagData?.map(item => item.tag as Tag) || [];
    
    // Process the post
    const post = processPost(data, hasNewSchema);
    
    // Add tags
    post.tags = tags;

    // Add votes and comments counts
    const [enrichedPosts] = await enrichPostsWithCounts([post]);
    return enrichedPosts || null;
  } catch (error: any) {
    toast.error('Error fetching post: ' + error.message);
    console.error('Error fetching post:', error);
    return null;
  }
};

// Create a new post
export const createPost = async (
  postData: PostFormData, 
  userId: string | undefined, 
  file?: File
): Promise<Post | null> => {
  if (!userId) {
    toast.error('You must be logged in to create a post');
    return null;
  }

  try {
    let fileUrl = null;
    if (file && (postData.content_type === 'file' || postData.content_type === 'image')) {
      fileUrl = await uploadFile(file);
      if (!fileUrl) return null;
    }

    // Check if we have the new schema
    const hasNewSchema = await getSchemaSupport();

    let newPost: any = {};

    if (hasNewSchema) {
      newPost = {
        title: postData.title,
        content: postData.content,
        user_id: userId,
        content_type: postData.content_type,
        file_url: fileUrl,
        link_url: postData.link_url || null,
        is_featured: false,
        is_approved: true
      };
    } else {
      // Legacy schema only has content, image_url and user_id
      newPost = {
        content: `${postData.title}\n\n${postData.content}`,
        image_url: fileUrl, // We'll use image_url for all file types in legacy schema
        user_id: userId
      };
      console.warn('Using legacy posts table schema for insert');
    }

    // Use explicit type assertion to avoid excessive type instantiation
    const result = await supabase
      .from('posts')
      .insert([newPost])
      .select()
      .single();

    const { data, error } = result as unknown as {
      data: any;
      error: any;
    };

    if (error) throw error;

    // Add tags if any
    if (postData.tags && postData.tags.length > 0) {
      const tagInserts = postData.tags.map(tagId => ({
        post_id: data.id,
        tag_id: tagId
      }));

      const { error: tagError } = await supabase
        .from('post_tags')
        .insert(tagInserts);

      if (tagError) throw tagError;
    }

    toast.success('Post created successfully');
    
    // Process the post
    return processPost(data, hasNewSchema);
  } catch (error: any) {
    toast.error('Error creating post: ' + error.message);
    console.error('Error creating post:', error);
    return null;
  }
};

// Update an existing post
export const updatePost = async (
  id: string, 
  postData: PostFormData, 
  userId: string | undefined, 
  file?: File
): Promise<boolean> => {
  if (!userId) {
    toast.error('You must be logged in to update a post');
    return false;
  }

  try {
    // Use explicit type assertion to avoid excessive type instantiation
    const result = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    const { data: existingPost, error: fetchError } = result as unknown as {
      data: any;
      error: any;
    };

    if (fetchError) throw fetchError;
    if (!existingPost) {
      toast.error('Post not found or you do not have permission to edit it');
      return false;
    }

    // Check if we have the new schema
    const hasNewSchema = await getSchemaSupport();

    // Handle image_url or file_url based on schema
    // For legacy schema (image_url), or new schema (file_url or image_url)
    let fileUrl = existingPost.image_url;
    if (hasNewSchema && existingPost.file_url) {
      fileUrl = existingPost.file_url;
    }
      
    if (file && (postData.content_type === 'file' || postData.content_type === 'image')) {
      const newFileUrl = await uploadFile(file);
      if (newFileUrl) fileUrl = newFileUrl;
    }

    let updateData: any = {};

    if (hasNewSchema) {
      updateData = {
        title: postData.title,
        content: postData.content,
        content_type: postData.content_type,
        file_url: fileUrl,
        link_url: postData.link_url || null,
      };
    } else {
      // Legacy schema only has content and image_url
      updateData = {
        content: `${postData.title}\n\n${postData.content}`,
        image_url: fileUrl
      };
      console.warn('Using legacy posts table schema for update');
    }

    const { error: updateError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id);

    if (updateError) throw updateError;

    // Update tags - first remove existing tags
    const { error: deleteTagError } = await supabase
      .from('post_tags')
      .delete()
      .eq('post_id', id);

    if (deleteTagError) throw deleteTagError;

    // Then add new tags
    if (postData.tags && postData.tags.length > 0) {
      const tagInserts = postData.tags.map(tagId => ({
        post_id: id,
        tag_id: tagId
      }));

      const { error: tagError } = await supabase
        .from('post_tags')
        .insert(tagInserts);

      if (tagError) throw tagError;
    }

    toast.success('Post updated successfully');
    return true;
  } catch (error: any) {
    toast.error('Error updating post: ' + error.message);
    console.error('Error updating post:', error);
    return false;
  }
};

// Delete a post
export const deletePost = async (id: string, userId: string | undefined): Promise<boolean> => {
  if (!userId) {
    toast.error('You must be logged in to delete a post');
    return false;
  }

  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    toast.success('Post deleted successfully');
    return true;
  } catch (error: any) {
    toast.error('Error deleting post: ' + error.message);
    console.error('Error deleting post:', error);
    return false;
  }
};

// Search for posts based on criteria
export const searchPosts = async (
  params: {
    query: string,
    contentType?: ContentType | 'all',
    tag?: string,
    featured?: boolean
  }
): Promise<Post[]> => {
  try {
    // Check if we have the new schema
    const hasNewSchema = await getSchemaSupport();

    // Start building the query
    let supabaseQuery = supabase
      .from('posts')
      .select(`
        *,
        user:profiles (
          full_name,
          avatar_url
        )
      `);
      
    // Add content_type filter if specified and if we have the new schema
    if (hasNewSchema && params.contentType && params.contentType !== 'all') {
      supabaseQuery = supabaseQuery.eq('content_type', params.contentType);
    }
    
    // Add featured filter if specified and if we have the new schema
    if (hasNewSchema && params.featured) {
      supabaseQuery = supabaseQuery.eq('is_featured', true);
    }
    
    // Add search query if specified
    if (params.query) {
      if (hasNewSchema) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${params.query}%,content.ilike.%${params.query}%`);
      } else {
        supabaseQuery = supabaseQuery.ilike('content', `%${params.query}%`);
      }
    }
    
    // Execute the query with explicit type assertion
    const result = await supabaseQuery.order('created_at', { ascending: false });
    
    const { data, error } = result as unknown as {
      data: any[];
      error: any;
    };

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Handle tag filtering separately after getting initial results
    let filteredPosts = [...data];
    
    if (params.tag) {
      // Get post IDs that have the specified tag
      const { data: taggedPostsData, error: tagError } = await supabase
        .from('post_tags')
        .select('post_id')
        .eq('tag_id', params.tag);
        
      if (tagError) throw tagError;
      
      if (taggedPostsData && taggedPostsData.length > 0) {
        const taggedPostIds = taggedPostsData.map(item => item.post_id);
        // Filter posts that match the tagged post IDs
        filteredPosts = filteredPosts.filter(post => taggedPostIds.includes(post.id));
      } else {
        // If no posts with this tag, return empty array
        return [];
      }
    }
    
    // Process posts using the shared function
    const mappedPosts = filteredPosts.map((post: any) => processPost(post, hasNewSchema));
    
    const enrichedPosts = await enrichPostsWithCounts(mappedPosts);
    
    // Now fetch tags for each post
    for (const post of enrichedPosts) {
      const { data: tagData } = await supabase
        .from('post_tags')
        .select(`
          tag:tags (
            id,
            name
          )
        `)
        .eq('post_id', post.id);
        
      if (tagData && tagData.length > 0) {
        post.tags = tagData.map(item => item.tag as Tag);
      } else {
        post.tags = [];
      }
    }
    
    return enrichedPosts;
  } catch (error: any) {
    toast.error('Error searching posts: ' + error.message);
    console.error('Error searching posts:', error);
    return [];
  }
};

// Helper function to add counts and user interactions to posts
export const enrichPostsWithCounts = async (posts: Post[]): Promise<Post[]> => {
  if (!posts.length) return [];
  
  const postIds = posts.map(post => post.id);
  
  // Simplified approach to get votes counts using direct query with explicit type assertion
  const votesResult = await supabase.from('votes').select('post_id, is_upvote');
  const { data: votesData } = votesResult as unknown as { data: any[]; error: any; };
  
  // Simplified approach to get comments counts using direct query with explicit type assertion
  const commentsResult = await supabase.from('comments').select('post_id, id');
  const { data: commentsData } = commentsResult as unknown as { data: any[]; error: any; };
  
  // Get user's votes and bookmarks if logged in
  let userVotes: Record<string, boolean> = {};
  let userBookmarks: Record<string, boolean> = {};
  
  const user = await getCurrentUser();
  
  if (user) {
    // Get user votes
    const { data: userVotesData } = await supabase
      .from('votes')
      .select('post_id')
      .eq('user_id', user.id);
      
    if (userVotesData) {
      userVotes = userVotesData.reduce((acc: Record<string, boolean>, vote: any) => {
        if (vote && vote.post_id) {
          acc[vote.post_id] = true;
        }
        return acc;
      }, {});
    }
    
    // Get user bookmarks
    const { data: userBookmarksData } = await supabase
      .from('bookmarks')
      .select('post_id')
      .eq('user_id', user.id);
      
    if (userBookmarksData) {
      userBookmarks = userBookmarksData.reduce((acc: Record<string, boolean>, bookmark: any) => {
        if (bookmark && bookmark.post_id) {
          acc[bookmark.post_id] = true;
        }
        return acc;
      }, {});
    }
  }
  
  // Count votes by post
  const voteCounts: Record<string, number> = {};
  if (votesData && Array.isArray(votesData)) {
    votesData.forEach((vote: any) => {
      if (vote && typeof vote === 'object' && vote.post_id && vote.is_upvote) {
        voteCounts[vote.post_id] = (voteCounts[vote.post_id] || 0) + 1;
      }
    });
  }
  
  // Count comments by post
  const commentCounts: Record<string, number> = {};
  if (commentsData && Array.isArray(commentsData)) {
    commentsData.forEach((comment: any) => {
      if (comment && typeof comment === 'object' && comment.post_id) {
        commentCounts[comment.post_id] = (commentCounts[comment.post_id] || 0) + 1;
      }
    });
  }
  
  // Add counts to posts
  return posts.map((post: Post) => {
    return {
      ...post,
      votes_count: voteCounts[post.id] || 0,
      comments_count: commentCounts[post.id] || 0,
      user_has_voted: userVotes[post.id] || false,
      user_has_bookmarked: userBookmarks[post.id] || false,
    };
  });
};

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
};
