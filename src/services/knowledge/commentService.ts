import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Comment } from '@/types/knowledge';

// Fetch comments for a post
export const fetchCommentsByPostId = async (postId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:profiles (
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Transform the data to match the Comment interface
    const comments: Comment[] = data.map((item: any) => ({
      id: item.id,
      content: item.content,
      user_id: item.user_id,
      post_id: item.post_id,
      created_at: item.created_at,
      updated_at: item.updated_at || item.created_at,
      user: item.user ? {
        full_name: item.user.full_name || 'Unknown User',
        avatar_url: item.user.avatar_url || null
      } : { full_name: 'Unknown User', avatar_url: null }
    }));
    
    return comments;
  } catch (error: any) {
    toast.error('Error fetching comments: ' + error.message);
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Add a comment to a post
export const addComment = async (postId: string, content: string, userId: string | undefined): Promise<Comment | null> => {
  if (!userId) {
    toast.error('You must be logged in to comment');
    return null;
  }

  try {
    const { data: rawData, error } = await supabase
      .from('comments')
      .insert([
        {
          content,
          post_id: postId,
          user_id: userId
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Get user info for the comment
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', userId)
      .single();
    
    if (userError) throw userError;
    
    // Transform to match Comment interface
    const comment: Comment = {
      id: rawData.id,
      content: rawData.content,
      user_id: rawData.user_id,
      post_id: rawData.post_id,
      created_at: rawData.created_at,
      updated_at: rawData.updated_at || rawData.created_at,
      user: userData ? {
        full_name: userData.full_name || 'Unknown User',
        avatar_url: userData.avatar_url || null
      } : { full_name: 'Unknown User', avatar_url: null }
    };
    
    toast.success('Comment added');
    return comment;
  } catch (error: any) {
    toast.error('Error adding comment: ' + error.message);
    console.error('Error adding comment:', error);
    return null;
  }
};

// Delete a comment
export const deleteComment = async (id: string, userId: string | undefined): Promise<boolean> => {
  if (!userId) {
    toast.error('You must be logged in to delete a comment');
    return false;
  }

  try {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    toast.success('Comment deleted');
    return true;
  } catch (error: any) {
    toast.error('Error deleting comment: ' + error.message);
    console.error('Error deleting comment:', error);
    return false;
  }
};
