
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Post } from '@/types/knowledge';
import { enrichPostsWithCounts } from './postService';
import { hasNewPostsSchema, transformLegacyPost, extractUserInfo } from './dbSchemaService';

// Fetch all approved posts
export const fetchPosts = async (): Promise<Post[]> => {
  try {
    // Check if we have the new schema
    const hasNewSchema = await hasNewPostsSchema();

    // Start building the query
    const query = supabase
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
      query.eq('is_approved', true);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Process posts to add tags, vote counts, etc.
    const mappedPosts = data.map(post => {
      // For legacy schema, transform the post
      const processedPost = hasNewSchema ? post : transformLegacyPost(post);
      
      // Extract user info safely
      const userInfo = extractUserInfo(processedPost);
      
      return {
        id: processedPost.id,
        title: processedPost.title || 'Untitled Post',
        content: processedPost.content || '',
        user_id: processedPost.user_id,
        content_type: processedPost.content_type || 'article',
        file_url: processedPost.file_url || processedPost.image_url || null,
        link_url: processedPost.link_url || null,
        image_url: processedPost.image_url || null,
        created_at: processedPost.created_at,
        updated_at: processedPost.updated_at || processedPost.created_at,
        is_featured: processedPost.is_featured || false,
        is_approved: processedPost.is_approved || true,
        user: userInfo,
        tags: [],
        votes_count: 0,
        comments_count: 0,
        user_has_voted: false,
        user_has_bookmarked: false
      } as Post;
    });
    
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
    const hasNewSchema = await hasNewPostsSchema();
      
    if (!hasNewSchema) {
      console.warn("Featured posts not supported with current schema");
      return [];
    }

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
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Map and transform the posts
    const mappedPosts = data.map(post => {
      // Extract user info safely
      const userInfo = extractUserInfo(post);

      return {
        id: post.id,
        title: post.title || 'Untitled Post',
        content: post.content || '',
        user_id: post.user_id,
        content_type: post.content_type || 'article',
        file_url: post.file_url || null,
        link_url: post.link_url || null,
        image_url: post.image_url || null,
        created_at: post.created_at,
        updated_at: post.updated_at || post.created_at,
        is_featured: post.is_featured || false,
        is_approved: post.is_approved || true,
        user: userInfo,
        tags: [],
        votes_count: 0,
        comments_count: 0,
        user_has_voted: false,
        user_has_bookmarked: false
      } as Post;
    });
    
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
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Check if we have the new schema
    const hasNewSchema = await hasNewPostsSchema();
    
    // Map and transform the posts
    const mappedPosts = data.map(post => {
      // For legacy schema, transform the post
      const processedPost = hasNewSchema ? post : transformLegacyPost(post);
      
      // Extract user info safely
      const userInfo = extractUserInfo(processedPost);
      
      return {
        id: processedPost.id,
        title: processedPost.title || 'Untitled Post',
        content: processedPost.content || '',
        user_id: processedPost.user_id,
        content_type: processedPost.content_type || 'article',
        file_url: processedPost.file_url || processedPost.image_url || null,
        link_url: processedPost.link_url || null,
        image_url: processedPost.image_url || null,
        created_at: processedPost.created_at,
        updated_at: processedPost.updated_at || processedPost.created_at,
        is_featured: processedPost.is_featured || false,
        is_approved: processedPost.is_approved || true,
        user: userInfo,
        tags: [],
        votes_count: 0,
        comments_count: 0,
        user_has_voted: false,
        user_has_bookmarked: false
      } as Post;
    });
    
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
        .order('created_at', { ascending: false });

      if (bookmarkedPostsError) throw bookmarkedPostsError;
      
      if (!bookmarkedPostsData || bookmarkedPostsData.length === 0) {
        return [];
      }
      
      // Check if we have the new schema
      const hasNewSchema = await hasNewPostsSchema();
      
      // Map and transform the posts
      const mappedPosts = bookmarkedPostsData.map(post => {
        // For legacy schema, transform the post
        const processedPost = hasNewSchema ? post : transformLegacyPost(post);
        
        // Extract user info safely
        const userInfo = extractUserInfo(processedPost);
        
        return {
          id: processedPost.id,
          title: processedPost.title || 'Untitled Post',
          content: processedPost.content || '',
          user_id: processedPost.user_id,
          content_type: processedPost.content_type || 'article',
          file_url: processedPost.file_url || processedPost.image_url || null,
          link_url: processedPost.link_url || null,
          image_url: processedPost.image_url || null,
          created_at: processedPost.created_at,
          updated_at: processedPost.updated_at || processedPost.created_at,
          is_featured: processedPost.is_featured || false,
          is_approved: processedPost.is_approved || true,
          user: userInfo,
          tags: [],
          votes_count: 0,
          comments_count: 0,
          user_has_voted: false,
          user_has_bookmarked: false
        } as Post;
      });
      
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
