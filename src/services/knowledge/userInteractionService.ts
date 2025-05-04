
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Upvote a post
export const upvotePost = async (postId: string, userId: string | undefined): Promise<boolean> => {
  if (!userId) {
    toast.error('You must be logged in to vote');
    return false;
  }

  try {
    const { error } = await supabase
      .from('votes')
      .upsert({
        post_id: postId,
        user_id: userId,
        is_upvote: true
      });

    if (error) throw error;
    return true;
  } catch (error: any) {
    toast.error('Error voting: ' + error.message);
    console.error('Error voting:', error);
    return false;
  }
};

// Remove a vote from a post
export const removeVote = async (postId: string, userId: string | undefined): Promise<boolean> => {
  if (!userId) {
    toast.error('You must be logged in to remove a vote');
    return false;
  }

  try {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error: any) {
    toast.error('Error removing vote: ' + error.message);
    console.error('Error removing vote:', error);
    return false;
  }
};

// Bookmark a post
export const bookmarkPost = async (postId: string, userId: string | undefined): Promise<boolean> => {
  if (!userId) {
    toast.error('You must be logged in to bookmark');
    return false;
  }

  try {
    const { error } = await supabase
      .from('bookmarks')
      .insert({
        post_id: postId,
        user_id: userId
      });

    if (error) throw error;
    toast.success('Post bookmarked');
    return true;
  } catch (error: any) {
    toast.error('Error bookmarking post: ' + error.message);
    console.error('Error bookmarking post:', error);
    return false;
  }
};

// Remove a bookmark
export const removeBookmark = async (postId: string, userId: string | undefined): Promise<boolean> => {
  if (!userId) {
    toast.error('You must be logged in to remove a bookmark');
    return false;
  }

  try {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;
    toast.success('Bookmark removed');
    return true;
  } catch (error: any) {
    toast.error('Error removing bookmark: ' + error.message);
    console.error('Error removing bookmark:', error);
    return false;
  }
};
