
import { supabase } from '@/integrations/supabase/client';

export interface TableColumn {
  column_name: string;
  data_type: string;
}

// Safe check if a column exists in a table
export const columnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    // Instead of querying information_schema directly (which causes typing issues),
    // we'll use a simple client-side approach by trying to select from the table with a filter
    // This is less accurate but avoids TypeScript errors with information_schema
    const { data, error } = await supabase.rpc('get_table_columns', { p_table_name: tableName })
      .then(response => {
        if (response.error) {
          console.error('Error fetching table columns:', response.error);
          return { data: null, error: response.error };
        }
        
        // Filter columns locally
        const columns = response.data as TableColumn[] || [];
        const foundColumn = columns.find(col => col.column_name === columnName);
        return { data: foundColumn || null, error: null };
      });
    
    if (error) {
      console.error(`Error checking for column ${columnName}:`, error);
      return false;
    }
    
    return data !== null;
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

// Process a post from the database to the expected Post format
export const processPost = (post: any, hasNewSchema: boolean): any => {
  // For legacy schema, transform the post
  const processedPost = hasNewSchema ? post : transformLegacyPost(post);
  
  // Extract user info safely
  const userInfo = extractUserInfo(processedPost);
  
  // Return a properly formatted Post object with all required fields
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
  };
};
