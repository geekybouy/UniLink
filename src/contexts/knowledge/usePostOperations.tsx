
import { Post, PostFormData } from '@/types/knowledge';
import * as postService from '@/services/knowledge/postService';

export const usePostOperations = (userId?: string, refreshData?: () => Promise<void>) => {
  const createPost = async (postData: PostFormData, file?: File): Promise<Post | null> => {
    const result = await postService.createPost(postData, userId, file);
    if (result && refreshData) refreshData(); // Refresh data
    return result;
  };

  const updatePost = async (id: string, postData: PostFormData, file?: File): Promise<boolean> => {
    const result = await postService.updatePost(id, postData, userId, file);
    if (result && refreshData) refreshData(); // Refresh data
    return result;
  };

  const deletePost = async (id: string): Promise<boolean> => {
    const result = await postService.deletePost(id, userId);
    if (result && refreshData) refreshData(); // Refresh data
    return result;
  };

  const fetchPostById = postService.fetchPostById;
  const searchPosts = postService.searchPosts;

  return {
    createPost,
    updatePost,
    deletePost,
    fetchPostById,
    searchPosts,
  };
};
