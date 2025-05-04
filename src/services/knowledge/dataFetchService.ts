
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Post } from '@/types/knowledge';
import { enrichPostsWithCounts } from './postService';

// Fetch all approved posts
export const fetchPosts = async (): Promise<Post[]> => {
  try {
    // First check if we have a posts table with the expanded schema
    const { data: tableInfo, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'posts' });
      
    if (schemaError) {
      console.error('Error checking table schema:', schemaError);
    }

    // Determine if we have the new schema or old schema
    const hasNewSchema = tableInfo && Array.isArray(tableInfo) && 
      tableInfo.some(col => col.column_name === 'is_approved');

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
    // First, map all posts to the correct format based on schema
    const mappedPosts = data.map(post => {
      let titleContent = post.content;
      let actualContent = '';
      
      // For legacy schema, extract title from the content (first line)
      if (!hasNewSchema && post.content) {
        const lines = post.content.split('\n');
        if (lines.length > 0) {
          titleContent = lines[0];
          actualContent = lines.slice(1).join('\n').trim();
        }
      }
      
      return {
        id: post.id,
        title: post.title || titleContent || 'Untitled Post',
        content: hasNewSchema ? post.content : actualContent,
        user_id: post.user_id,
        content_type: (post.content_type as any) || 'article',
        file_url: post.file_url || null,
        link_url: post.link_url || null,
        image_url: post.image_url || null,
        created_at: post.created_at,
        updated_at: post.updated_at || post.created_at,
        is_featured: post.is_featured || false,
        is_approved: post.is_approved || true,
        user: post.user ? {
          full_name: post.user.full_name || 'Unknown User',
          avatar_url: post.user.avatar_url || null,
        } : { full_name: 'Unknown User', avatar_url: null },
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
    // First check if we have a posts table with the expanded schema
    const { data: tableInfo, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'posts' });
      
    if (schemaError) {
      console.error('Error checking table schema:', schemaError);
    }

    // Determine if we have the new schema or old schema
    const hasNewSchema = tableInfo && Array.isArray(tableInfo) && 
      tableInfo.some(col => col.column_name === 'is_featured');
      
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
    const mappedPosts = data.map(post => ({
      id: post.id,
      title: post.title || 'Untitled Post',
      content: post.content || '',
      user_id: post.user_id,
      content_type: (post.content_type as any) || 'article',
      file_url: post.file_url || null,
      link_url: post.link_url || null,
      image_url: post.image_url || null,
      created_at: post.created_at,
      updated_at: post.updated_at || post.created_at,
      is_featured: post.is_featured || false,
      is_approved: post.is_approved || true,
      user: post.user ? {
        full_name: post.user.full_name || 'Unknown User',
        avatar_url: post.user.avatar_url || null,
      } : { full_name: 'Unknown User', avatar_url: null },
      tags: [],
      votes_count: 0,
      comments_count: 0,
      user_has_voted: false,
      user_has_bookmarked: false
    } as Post));
    
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
    
    // First check if we have a posts table with the expanded schema
    const { data: tableInfo, error: schemaError } = await supabase
      .rpc('get_table_columns', { table_name: 'posts' });
      
    if (schemaError) {
      console.error('Error checking table schema:', schemaError);
    }

    // Determine if we have the new schema or old schema
    const hasNewSchema = tableInfo && Array.isArray(tableInfo) && 
      tableInfo.some(col => col.column_name === 'title');
    
    // Map and transform the posts
    const mappedPosts = data.map(post => {
      let titleContent = post.content;
      let actualContent = '';
      
      // For legacy schema, extract title from the content (first line)
      if (!hasNewSchema && post.content) {
        const lines = post.content.split('\n');
        if (lines.length > 0) {
          titleContent = lines[0];
          actualContent = lines.slice(1).join('\n').trim();
        }
      }
      
      return {
        id: post.id,
        title: post.title || titleContent || 'Untitled Post',
        content: hasNewSchema ? post.content : actualContent,
        user_id: post.user_id,
        content_type: (post.content_type as any) || 'article',
        file_url: post.file_url || null,
        link_url: post.link_url || null,
        image_url: post.image_url || null,
        created_at: post.created_at,
        updated_at: post.updated_at || post.created_at,
        is_featured: post.is_featured || false,
        is_approved: post.is_approved || true,
        user: post.user ? {
          full_name: post.user.full_name || 'Unknown User',
          avatar_url: post.user.avatar_url || null,
        } : { full_name: 'Unknown User', avatar_url: null },
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
      
      // First check if we have a posts table with the expanded schema
      const { data: tableInfo, error: schemaError } = await supabase
        .rpc('get_table_columns', { table_name: 'posts' });
        
      if (schemaError) {
        console.error('Error checking table schema:', schemaError);
      }

      // Determine if we have the new schema or old schema
      const hasNewSchema = tableInfo && Array.isArray(tableInfo) && 
        tableInfo.some(col => col.column_name === 'title');
      
      // Map and transform the posts
      const mappedPosts = bookmarkedPostsData.map(post => {
        let titleContent = post.content;
        let actualContent = '';
        
        // For legacy schema, extract title from the content (first line)
        if (!hasNewSchema && post.content) {
          const lines = post.content.split('\n');
          if (lines.length > 0) {
            titleContent = lines[0];
            actualContent = lines.slice(1).join('\n').trim();
          }
        }
        
        return {
          id: post.id,
          title: post.title || titleContent || 'Untitled Post',
          content: hasNewSchema ? post.content : actualContent,
          user_id: post.user_id,
          content_type: (post.content_type as any) || 'article',
          file_url: post.file_url || null,
          link_url: post.link_url || null,
          image_url: post.image_url || null,
          created_at: post.created_at,
          updated_at: post.updated_at || post.created_at,
          is_featured: post.is_featured || false,
          is_approved: post.is_approved || true,
          user: post.user ? {
            full_name: post.user.full_name || 'Unknown User',
            avatar_url: post.user.avatar_url || null,
          } : { full_name: 'Unknown User', avatar_url: null },
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
