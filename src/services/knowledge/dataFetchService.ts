
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Post } from '@/types/knowledge';
import { enrichPostsWithCounts } from './postService';

// Fetch all approved posts
export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:profiles!inner (
          full_name,
          avatar_url
        )
      `)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Get votes counts
    const postsWithCounts = await enrichPostsWithCounts(data || []);
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
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:profiles!inner (
          full_name,
          avatar_url
        )
      `)
      .eq('is_approved', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const featuredWithCounts = await enrichPostsWithCounts(data || []);
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
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:profiles!inner (
          full_name,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const userPostsWithCounts = await enrichPostsWithCounts(data || []);
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
      const { data: bookmarkedPostsData, error: bookmarkedPostsError } = await supabase
        .from('posts')
        .select(`
          *,
          user:profiles!inner (
            full_name,
            avatar_url
          )
        `)
        .in('id', bookmarkedPostIds)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (bookmarkedPostsError) throw bookmarkedPostsError;
      
      const bookmarkedWithCounts = await enrichPostsWithCounts(bookmarkedPostsData || []);
      return bookmarkedWithCounts;
    } 
    
    return [];
  } catch (error: any) {
    toast.error('Error loading bookmarked posts: ' + error.message);
    console.error('Error loading bookmarked posts:', error);
    return [];
  }
};
