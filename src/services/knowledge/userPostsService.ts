
import { toast } from 'sonner';
import { Post } from '@/types/knowledge';
import { enrichPostsWithCounts } from './postStatsService';
import { hasNewPostsSchema, processPost } from './dbSchemaService';
import { typedSupabaseClient } from '@/integrations/supabase/customClient';

// Fetch user posts
export const fetchUserPosts = async (userId: string | undefined): Promise<Post[]> => {
  if (!userId) return [];
  
  try {
    // Use the typedSupabaseClient for user posts
    const postsQuery = typedSupabaseClient.posts.selectWithUser()
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    const { data, error } = await postsQuery;

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Check if we have the new schema
    const hasNewSchema = await hasNewPostsSchema();
    
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
    // Get bookmarks using typedSupabaseClient
    const { data: bookmarksData, error: bookmarksError } = await typedSupabaseClient.bookmarks.getByUser(userId);

    if (bookmarksError) throw bookmarksError;

    if (bookmarksData && bookmarksData.length > 0) {
      const bookmarkedPostIds = bookmarksData.map(bookmark => bookmark.post_id);
      
      // Use typedSupabaseClient to fetch bookmarked posts
      const postsQuery = typedSupabaseClient.posts.selectWithUser()
        .in('id', bookmarkedPostIds)
        .order('created_at', { ascending: false });
      
      const { data: bookmarkedPostsData, error: bookmarkedPostsError } = await postsQuery;

      if (bookmarkedPostsError) throw bookmarkedPostsError;
      
      if (!bookmarkedPostsData || bookmarkedPostsData.length === 0) {
        return [];
      }
      
      // Check if we have the new schema
      const hasNewSchema = await hasNewPostsSchema();
      
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
