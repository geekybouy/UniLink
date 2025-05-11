
import * as userInteractionService from '@/services/knowledge/userInteractionService';

export const useUserInteractions = (userId?: string, refreshData?: () => Promise<void>) => {
  const upvotePost = async (postId: string): Promise<boolean> => {
    const result = await userInteractionService.upvotePost(postId, userId);
    if (result && refreshData) refreshData(); // Refresh data
    return result;
  };

  const removeVote = async (postId: string): Promise<boolean> => {
    const result = await userInteractionService.removeVote(postId, userId);
    if (result && refreshData) refreshData(); // Refresh data
    return result;
  };

  const bookmarkPost = async (postId: string): Promise<boolean> => {
    const result = await userInteractionService.bookmarkPost(postId, userId);
    if (result && refreshData) refreshData(); // Refresh data
    return result;
  };

  const removeBookmark = async (postId: string): Promise<boolean> => {
    const result = await userInteractionService.removeBookmark(postId, userId);
    if (result && refreshData) refreshData(); // Refresh data
    return result;
  };

  return {
    upvotePost,
    removeVote,
    bookmarkPost,
    removeBookmark,
  };
};
