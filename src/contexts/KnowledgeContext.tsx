import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { 
  Post, 
  Comment, 
  Tag, 
  ContentType, 
  PostFormData,
  SearchParams
} from '@/types/knowledge';

// Import services
import * as postService from '@/services/knowledge/postService'; 
import * as commentService from '@/services/knowledge/commentService';
import * as userInteractionService from '@/services/knowledge/userInteractionService';
import * as tagService from '@/services/knowledge/tagService';
import * as dataFetchService from '@/services/knowledge/dataFetchService';

interface KnowledgeContextType {
  posts: Post[];
  featuredPosts: Post[];
  bookmarkedPosts: Post[];
  userPosts: Post[];
  tags: Tag[];
  isLoading: boolean;
  createPost: (postData: PostFormData, file?: File) => Promise<Post | null>;
  updatePost: (id: string, postData: PostFormData, file?: File) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
  fetchPostById: (id: string) => Promise<Post | null>;
  fetchCommentsByPostId: (postId: string) => Promise<Comment[]>;
  addComment: (postId: string, content: string) => Promise<Comment | null>;
  deleteComment: (id: string) => Promise<boolean>;
  upvotePost: (postId: string) => Promise<boolean>;
  removeVote: (postId: string) => Promise<boolean>;
  bookmarkPost: (postId: string) => Promise<boolean>;
  removeBookmark: (postId: string) => Promise<boolean>;
  searchPosts: (params: SearchParams) => Promise<Post[]>;
  createTag: (name: string) => Promise<Tag | null>;
  refreshPosts: () => Promise<void>;
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

export const KnowledgeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Run these in parallel
      const [postsData, featuredData, tagsData] = await Promise.all([
        dataFetchService.fetchPosts(),
        dataFetchService.fetchFeaturedPosts(),
        tagService.fetchTags()
      ]);
      
      setPosts(postsData);
      setFeaturedPosts(featuredData);
      setTags(tagsData);
      
      // Only fetch these if user is logged in
      if (user) {
        const [userPostsData, bookmarkedPostsData] = await Promise.all([
          dataFetchService.fetchUserPosts(user.id),
          dataFetchService.fetchBookmarkedPosts(user.id)
        ]);
        
        setUserPosts(userPostsData);
        setBookmarkedPosts(bookmarkedPostsData);
      }
    } catch (error) {
      console.error("Error fetching knowledge data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Expose service functions with user context
  const createPostWithUser = async (postData: PostFormData, file?: File) => {
    const result = await postService.createPost(postData, user?.id, file);
    if (result) fetchData(); // Refresh data
    return result;
  };

  const updatePostWithUser = async (id: string, postData: PostFormData, file?: File) => {
    const result = await postService.updatePost(id, postData, user?.id, file);
    if (result) fetchData(); // Refresh data
    return result;
  };

  const deletePostWithUser = async (id: string) => {
    const result = await postService.deletePost(id, user?.id);
    if (result) fetchData(); // Refresh data
    return result;
  };

  const addCommentWithUser = async (postId: string, content: string) => {
    return await commentService.addComment(postId, content, user?.id);
  };

  const deleteCommentWithUser = async (id: string) => {
    return await commentService.deleteComment(id, user?.id);
  };

  const upvotePostWithUser = async (postId: string) => {
    const result = await userInteractionService.upvotePost(postId, user?.id);
    if (result) fetchData(); // Refresh data
    return result;
  };

  const removeVoteWithUser = async (postId: string) => {
    const result = await userInteractionService.removeVote(postId, user?.id);
    if (result) fetchData(); // Refresh data
    return result;
  };

  const bookmarkPostWithUser = async (postId: string) => {
    const result = await userInteractionService.bookmarkPost(postId, user?.id);
    if (result) fetchData(); // Refresh data
    return result;
  };

  const removeBookmarkWithUser = async (postId: string) => {
    const result = await userInteractionService.removeBookmark(postId, user?.id);
    if (result) fetchData(); // Refresh data
    return result;
  };

  const createTagWithUser = async (name: string) => {
    const result = await tagService.createTag(name, user?.id);
    if (result) {
      // Update tags
      setTags(prevTags => [...prevTags, result]);
    }
    return result;
  };

  const value = {
    posts,
    featuredPosts,
    bookmarkedPosts,
    userPosts,
    tags,
    isLoading,
    createPost: createPostWithUser,
    updatePost: updatePostWithUser,
    deletePost: deletePostWithUser,
    fetchPostById: postService.fetchPostById,
    fetchCommentsByPostId: commentService.fetchCommentsByPostId,
    addComment: addCommentWithUser,
    deleteComment: deleteCommentWithUser,
    upvotePost: upvotePostWithUser,
    removeVote: removeVoteWithUser,
    bookmarkPost: bookmarkPostWithUser,
    removeBookmark: removeBookmarkWithUser,
    searchPosts: postService.searchPosts,
    createTag: createTagWithUser,
    refreshPosts: fetchData,
  };

  return (
    <KnowledgeContext.Provider value={value}>
      {children}
    </KnowledgeContext.Provider>
  );
};

export const useKnowledge = () => {
  const context = useContext(KnowledgeContext);
  if (context === undefined) {
    throw new Error('useKnowledge must be used within a KnowledgeProvider');
  }
  return context;
};
