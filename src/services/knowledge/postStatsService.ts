
import { supabase } from '@/integrations/supabase/client';
import { typedSupabaseClient } from '@/integrations/supabase/customClient';
import { Post } from '@/types/knowledge';

// Helper function to get current user
export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user || null;
};

// Helper function to add counts and user interactions to posts
export const enrichPostsWithCounts = async (posts: Post[]): Promise<Post[]> => {
  if (!posts.length) return [];
  
  const postIds = posts.map(post => post.id);
  
  // Get votes counts using typedSupabaseClient
  const { data: votesData } = await typedSupabaseClient.votes.select();
  
  // Get comments counts using typedSupabaseClient
  const { data: commentsData } = await typedSupabaseClient.comments.select();
  
  // Get user's votes and bookmarks if logged in
  let userVotes: Record<string, boolean> = {};
  let userBookmarks: Record<string, boolean> = {};
  
  const user = await getCurrentUser();
  
  if (user) {
    // Get user votes using typedSupabaseClient
    const { data: userVotesData } = await typedSupabaseClient.votes.getByUser(user.id);
      
    if (userVotesData) {
      userVotes = userVotesData.reduce((acc: Record<string, boolean>, vote: any) => {
        if (vote && vote.post_id) {
          acc[vote.post_id] = true;
        }
        return acc;
      }, {});
    }
    
    // Get user bookmarks using typedSupabaseClient
    const { data: userBookmarksData } = await typedSupabaseClient.bookmarks.getByUser(user.id);
      
    if (userBookmarksData) {
      userBookmarks = userBookmarksData.reduce((acc: Record<string, boolean>, bookmark: any) => {
        if (bookmark && bookmark.post_id) {
          acc[bookmark.post_id] = true;
        }
        return acc;
      }, {});
    }
  }
  
  // Count votes by post
  const voteCounts: Record<string, number> = {};
  if (votesData && Array.isArray(votesData)) {
    votesData.forEach((vote: any) => {
      if (vote && typeof vote === 'object' && vote.post_id && vote.is_upvote) {
        voteCounts[vote.post_id] = (voteCounts[vote.post_id] || 0) + 1;
      }
    });
  }
  
  // Count comments by post
  const commentCounts: Record<string, number> = {};
  if (commentsData && Array.isArray(commentsData)) {
    commentsData.forEach((comment: any) => {
      if (comment && typeof comment === 'object' && comment.post_id) {
        commentCounts[comment.post_id] = (commentCounts[comment.post_id] || 0) + 1;
      }
    });
  }
  
  // Add counts to posts
  return posts.map((post: Post) => {
    return {
      ...post,
      votes_count: voteCounts[post.id] || 0,
      comments_count: commentCounts[post.id] || 0,
      user_has_voted: userVotes[post.id] || false,
      user_has_bookmarked: userBookmarks[post.id] || false,
    };
  });
};
