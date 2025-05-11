
import { useState, useEffect } from 'react';
import { Post, Tag } from '@/types/knowledge';
import * as dataService from '@/services/knowledge/dataService';
import * as tagService from '@/services/knowledge/tagService';

export interface KnowledgeDataState {
  posts: Post[];
  featuredPosts: Post[];
  bookmarkedPosts: Post[];
  userPosts: Post[];
  tags: Tag[];
  isLoading: boolean;
}

export const useKnowledgeData = (userId?: string) => {
  const [state, setState] = useState<KnowledgeDataState>({
    posts: [],
    featuredPosts: [],
    bookmarkedPosts: [],
    userPosts: [],
    tags: [],
    isLoading: true,
  });

  const fetchData = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      // Run these in parallel
      const [postsData, featuredData, tagsData] = await Promise.all([
        dataService.fetchPosts(),
        dataService.fetchFeaturedPosts(),
        tagService.fetchTags()
      ]);
      
      setState(prev => ({
        ...prev,
        posts: postsData,
        featuredPosts: featuredData,
        tags: tagsData,
      }));
      
      // Only fetch these if user is logged in
      if (userId) {
        const [userPostsData, bookmarkedPostsData] = await Promise.all([
          dataService.fetchUserPosts(userId),
          dataService.fetchBookmarkedPosts(userId)
        ]);
        
        setState(prev => ({
          ...prev,
          userPosts: userPostsData,
          bookmarkedPosts: bookmarkedPostsData,
        }));
      }
    } catch (error) {
      console.error("Error fetching knowledge data:", error);
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    ...state,
    refreshData: fetchData,
  };
};
