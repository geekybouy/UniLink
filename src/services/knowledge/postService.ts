
// Re-export all post related services from their respective modules

// File upload functionality
export { uploadFile } from './fileService';

// CRUD operations for posts
export { 
  fetchPostById,
  createPost,
  updatePost,
  deletePost
} from './postCrudService';

// Post search and filtering
export { searchPosts } from './postSearchService';

// Post statistics and user interactions
export {
  enrichPostsWithCounts,
  getCurrentUser
} from './postStatsService';
