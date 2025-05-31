
// Re-export all data fetching functionality from their respective modules

// For fetching regular posts
export { 
  fetchPosts,
  fetchFeaturedPosts 
} from './postFetchService';

// For fetching user-related posts
export { 
  fetchUserPosts,
  fetchBookmarkedPosts 
} from './userPostsService';
