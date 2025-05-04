
import { supabase } from '@/integrations/supabase/client';

export interface TableColumn {
  column_name: string;
  data_type: string;
}

// Check if a column exists in a table
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    // Use system tables to check if column exists
    const { data, error } = await supabase.from('posts')
      .select('title')
      .limit(1);
    
    // If the query succeeds and includes this column, it exists
    if (!error && data !== null) {
      // For title specifically, if it's part of the returned data object keys
      return Object.prototype.hasOwnProperty.call(data[0] || {}, columnName);
    }
    return false;
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
  const lines = (post.content || '').split('\n');
  const title = lines.length > 0 ? lines[0] : 'Untitled Post';
  const content = lines.length > 1 ? lines.slice(1).join('\n').trim() : '';
  
  return {
    ...post,
    title,
    content,
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
  
  if (post.user) {
    // Check if user is a SelectQueryError or a valid object
    if (typeof post.user === 'object' && !post.user.error) {
      userInfo = {
        full_name: post.user.full_name || 'Unknown User',
        avatar_url: post.user.avatar_url || null
      };
    }
  }
  
  return userInfo;
};
