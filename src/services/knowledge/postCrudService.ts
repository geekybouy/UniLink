
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Post, PostFormData } from '@/types/knowledge';
import { hasNewPostsSchema, processPost } from './dbSchemaService';
import { uploadFile } from './fileService';
import { enrichPostsWithCounts } from './postStatsService';
import { typedSupabaseClient } from '@/integrations/supabase/customClient';

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
    const tags = tagData?.map(item => item.tag) || [];
    
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
