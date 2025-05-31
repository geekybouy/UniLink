
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Post } from '@/types/knowledge';
import { enrichPostsWithCounts } from './postStatsService';
import { 
  hasNewPostsSchema, 
  processPost 
} from './dbSchemaService';
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

// Fetch all approved posts
export const fetchPosts = async (): Promise<Post[]> => {
  try {
    // Check if we have the new schema
    const hasNewSchema = await getSchemaSupport();

    // Use the typedSupabaseClient to avoid type instantiation errors
    const postsQuery = typedSupabaseClient.posts.selectWithUser();
    
    // Add is_approved filter if the schema supports it
    if (hasNewSchema) {
      postsQuery.eq('is_approved', true);
    }
    
    // Execute the query with order
    postsQuery.order('created_at', { ascending: false });
    
    // Get the result
    const { data, error } = await postsQuery;

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Process posts to add tags, vote counts, etc.
    const mappedPosts = data.map((post: any) => processPost(post, hasNewSchema));
    
    // Get votes counts
    const postsWithCounts = await enrichPostsWithCounts(mappedPosts);
    return postsWithCounts;
  } catch (error: any) {
    toast.error('Error loading posts: ' + error.message);
    console.error('Error loading posts:', error);
    return [];
  }
};

// Fetch featured posts
export const fetchFeaturedPosts = async (): Promise<Post[]> => {
  try {
    // Check if we have the new schema
    const hasNewSchema = await getSchemaSupport();
      
    if (!hasNewSchema) {
      console.warn("Featured posts not supported with current schema");
      return [];
    }

    // Use the typedSupabaseClient to avoid type instantiation issues
    const postsQuery = typedSupabaseClient.posts.selectWithUser()
      .eq('is_approved', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false });
    
    const { data, error } = await postsQuery;

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Process posts
    const mappedPosts = data.map((post: any) => processPost(post, true));
    
    const featuredWithCounts = await enrichPostsWithCounts(mappedPosts);
    return featuredWithCounts;
  } catch (error: any) {
    toast.error('Error loading featured posts: ' + error.message);
    console.error('Error loading featured posts:', error);
    return [];
  }
};
