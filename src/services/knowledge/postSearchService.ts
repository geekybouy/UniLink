
import { typedSupabaseClient } from '@/integrations/supabase/customClient';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ContentType, Post, Tag } from '@/types/knowledge';
import { hasNewPostsSchema, processPost } from './dbSchemaService';
import { enrichPostsWithCounts } from './postStatsService';

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

    // Start building the query using typedSupabaseClient
    let postsQuery = typedSupabaseClient.posts.selectWithUser();
      
    // Add content_type filter if specified and if we have the new schema
    if (hasNewSchema && params.contentType && params.contentType !== 'all') {
      postsQuery = postsQuery.eq('content_type', params.contentType);
    }
    
    // Add featured filter if specified and if we have the new schema
    if (hasNewSchema && params.featured) {
      postsQuery = postsQuery.eq('is_featured', true);
    }
    
    // Add search query if specified
    if (params.query) {
      if (hasNewSchema) {
        postsQuery = postsQuery.or(`title.ilike.%${params.query}%,content.ilike.%${params.query}%`);
      } else {
        postsQuery = postsQuery.ilike('content', `%${params.query}%`);
      }
    }
    
    // Execute the query
    const { data, error } = await postsQuery.order('created_at', { ascending: false });

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
