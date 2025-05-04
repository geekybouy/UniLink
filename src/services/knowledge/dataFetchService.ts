
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Post } from '@/types/knowledge';
import { enrichPostsWithCounts } from './postService';
import { 
  hasNewPostsSchema, 
  processPost 
} from './dbSchemaService';

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

    // Start building the query
    let query = supabase
      .from('posts')
      .select(`
        *,
        user:profiles (
          full_name,
          avatar_url
        )
      `);

    // Add is_approved filter if the schema supports it
    if (hasNewSchema) {
      query = query.eq('is_approved', true);
    }
    
    // Execute the query with type assertion to avoid deep instantiation
    const { data, error } = await query.order('created_at', { ascending: false }) as any;

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

    // Execute the query with type assertion to avoid deep instantiation
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('is_approved', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false }) as any;

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

// Fetch user posts
export const fetchUserPosts = async (userId: string | undefined): Promise<Post[]> => {
  if (!userId) return [];
  
  try {
    // Execute the query with type assertion to avoid deep instantiation
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) as any;

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Check if we have the new schema
    const hasNewSchema = await getSchemaSupport();
    
    // Process posts
    const mappedPosts = data.map((post: any) => processPost(post, hasNewSchema));
    
    const userPostsWithCounts = await enrichPostsWithCounts(mappedPosts);
    return userPostsWithCounts;
  } catch (error: any) {
    toast.error('Error loading user posts: ' + error.message);
    console.error('Error loading user posts:', error);
    return [];
  }
};

// Fetch bookmarked posts
export const fetchBookmarkedPosts = async (userId: string | undefined): Promise<Post[]> => {
  if (!userId) return [];
  
  try {
    const { data: bookmarksData, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('post_id')
      .eq('user_id', userId);

    if (bookmarksError) throw bookmarksError;

    if (bookmarksData && bookmarksData.length > 0) {
      const bookmarkedPostIds = bookmarksData.map(bookmark => bookmark.post_id);
      
      // Execute the query with type assertion to avoid deep instantiation
      const { data: bookmarkedPostsData, error: bookmarkedPostsError } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles (
            full_name,
            avatar_url
          )
        `)
        .in('id', bookmarkedPostIds)
        .order('created_at', { ascending: false }) as any;

      if (bookmarkedPostsError) throw bookmarkedPostsError;
      
      if (!bookmarkedPostsData || bookmarkedPostsData.length === 0) {
        return [];
      }
      
      // Check if we have the new schema
      const hasNewSchema = await getSchemaSupport();
      
      // Process posts
      const mappedPosts = bookmarkedPostsData.map((post: any) => processPost(post, hasNewSchema));
      
      const bookmarkedWithCounts = await enrichPostsWithCounts(mappedPosts);
      return bookmarkedWithCounts;
    } 
    
    return [];
  } catch (error: any) {
    toast.error('Error loading bookmarked posts: ' + error.message);
    console.error('Error loading bookmarked posts:', error);
    return [];
  }
};
