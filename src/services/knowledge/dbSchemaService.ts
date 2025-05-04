
import { supabase } from '@/integrations/supabase/client';

export interface TableColumn {
  column_name: string;
  data_type: string;
}

// Safe check if a column exists in a table
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    // Use a simple query to check if the column exists
    // We'll directly query information_schema which is more reliable than using RPC
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', tableName)
      .eq('column_name', columnName)
      .maybeSingle();
    
    if (error) {
      console.error(`Error checking for column ${columnName}:`, error);
      return false;
    }
    
    return data !== null && data.column_name === columnName;
  } catch (error) {
    console.error(`Error checking for column ${columnName} in table ${tableName}:`, error);
    return false;
  }
};

// Check if the posts table has the new schema with title, content_type, etc.
export const hasNewPostsSchema = async (): Promise<boolean> => {
  return await columnExists('posts', 'title');
};

// Transform legacy post data to match the new schema
export const transformLegacyPost = (post: any) => {
  if (!post) return post;
  
  // Safely handle post content
  const content = post.content || '';
  const lines = content.split('\n');
  const title = lines.length > 0 ? lines[0] : 'Untitled Post';
  const newContent = lines.length > 1 ? lines.slice(1).join('\n').trim() : '';
  
  return {
    ...post,
    title,
    content: newContent,
    content_type: 'article', // Default for legacy posts
    file_url: post.image_url,
    link_url: null,
    updated_at: post.updated_at || post.created_at,
    is_featured: false,
    is_approved: true,
  };
};

// Extract user info safely from post data
export const extractUserInfo = (post: any) => {
  let userInfo = { full_name: 'Unknown User', avatar_url: null };
  
  if (post && post.user) {
    // Check if user is a valid object
    if (typeof post.user === 'object') {
      // If it's an error or doesn't have the expected fields, use default values
      if (post.user.error || !post.user.full_name) {
        return userInfo;
      }
      
      userInfo = {
        full_name: post.user.full_name || 'Unknown User',
        avatar_url: post.user.avatar_url || null
      };
    }
  }
  
  return userInfo;
};
