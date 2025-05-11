
import { Comment } from '@/types/knowledge';
import * as commentService from '@/services/knowledge/commentService';

export const useCommentOperations = (userId?: string) => {
  const fetchCommentsByPostId = commentService.fetchCommentsByPostId;

  const addComment = async (postId: string, content: string): Promise<Comment | null> => {
    return await commentService.addComment(postId, content, userId);
  };

  const deleteComment = async (id: string): Promise<boolean> => {
    return await commentService.deleteComment(id, userId);
  };

  return {
    fetchCommentsByPostId,
    addComment,
    deleteComment,
  };
};
