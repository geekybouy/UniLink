
import React, { createContext, useContext } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tag, Post, Comment, SearchParams, PostFormData } from '@/types/knowledge';
import { useKnowledgeData } from './useKnowledgeData';
import { usePostOperations } from './usePostOperations';
import { useCommentOperations } from './useCommentOperations';
import { useUserInteractions } from './useUserInteractions';
import { useTagOperations } from './useTagOperations';

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
  
  // Use our custom hooks
  const { posts, featuredPosts, bookmarkedPosts, userPosts, tags, isLoading, refreshData } = 
    useKnowledgeData(user?.id);
  
  const { createPost, updatePost, deletePost, fetchPostById, searchPosts } = 
    usePostOperations(user?.id, refreshData);
  
  const { fetchCommentsByPostId, addComment, deleteComment } = 
    useCommentOperations(user?.id);
  
  const { upvotePost, removeVote, bookmarkPost, removeBookmark } = 
    useUserInteractions(user?.id, refreshData);

  const { createTag } = useTagOperations(user?.id, (tags) => {});

  // Combine all the hooks' values into one context value
  const value = {
    posts,
    featuredPosts,
    bookmarkedPosts,
    userPosts,
    tags,
    isLoading,
    createPost,
    updatePost,
    deletePost,
    fetchPostById,
    fetchCommentsByPostId,
    addComment,
    deleteComment,
    upvotePost,
    removeVote,
    bookmarkPost,
    removeBookmark,
    searchPosts,
    createTag,
    refreshPosts: refreshData,
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
