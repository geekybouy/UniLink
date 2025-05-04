import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { 
  Post, 
  Comment, 
  Tag, 
  Vote, 
  ContentType, 
  PostFormData,
  SearchParams,
  Bookmark
} from '@/types/knowledge';

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
      fetchPosts();
      fetchTags();
    }
  }, [user]);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // Fetch all approved posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          user:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      
      // Get votes counts
      const postsWithCounts = await enrichPostsWithCounts(postsData || []);
      setPosts(postsWithCounts);

      // Fetch featured posts
      const { data: featuredData, error: featuredError } = await supabase
        .from('posts')
        .select(`
          *,
          user:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('is_approved', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false });

      if (featuredError) throw featuredError;
      
      const featuredWithCounts = await enrichPostsWithCounts(featuredData || []);
      setFeaturedPosts(featuredWithCounts);

      // Only fetch these if user is logged in
      if (user) {
        // Fetch user's posts
        const { data: userPostsData, error: userPostsError } = await supabase
          .from('posts')
          .select(`
            *,
            user:user_id (
              full_name,
              avatar_url
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (userPostsError) throw userPostsError;
        
        const userPostsWithCounts = await enrichPostsWithCounts(userPostsData || []);
        setUserPosts(userPostsWithCounts);

        // Fetch bookmarked posts using custom query to avoid type issues
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .rpc('get_user_bookmarks', { user_id: user.id });

        if (bookmarksError) throw bookmarksError;

        if (bookmarksData && bookmarksData.length > 0) {
          const bookmarkedPostIds = bookmarksData.map((bookmark: any) => bookmark.post_id);
          const { data: bookmarkedPostsData, error: bookmarkedPostsError } = await supabase
            .from('posts')
            .select(`
              *,
              user:user_id (
                full_name,
                avatar_url
              )
            `)
            .in('id', bookmarkedPostIds)
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

          if (bookmarkedPostsError) throw bookmarkedPostsError;
          
          const bookmarkedWithCounts = await enrichPostsWithCounts(bookmarkedPostsData || []);
          setBookmarkedPosts(bookmarkedWithCounts);
        }
      }
    } catch (error: any) {
      toast.error('Error loading posts: ' + error.message);
      console.error('Error loading posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const enrichPostsWithCounts = async (posts: any[]): Promise<Post[]> => {
    if (!posts.length) return [];
    
    const postIds = posts.map(post => post.id);
    
    // Get votes counts using RPC
    const { data: votesData } = await supabase
      .rpc('get_post_votes', { post_ids: postIds });
    
    // Get comments counts using RPC
    const { data: commentsData } = await supabase
      .rpc('get_post_comments', { post_ids: postIds });
    
    // Get user's votes and bookmarks if logged in
    let userVotes: Record<string, boolean> = {};
    let userBookmarks: Record<string, boolean> = {};
    
    if (user) {
      // Get user votes using RPC
      const { data: userVotesData } = await supabase
        .rpc('get_user_post_votes', { 
          user_id: user.id,
          post_ids: postIds
        });
        
      if (userVotesData && Array.isArray(userVotesData)) {
        userVotes = userVotesData.reduce((acc: Record<string, boolean>, vote: any) => {
          if (vote && typeof vote === 'object' && vote.post_id) {
            acc[vote.post_id] = true;
          }
          return acc;
        }, {});
      }
      
      // Get user bookmarks using RPC
      const { data: userBookmarksData } = await supabase
        .rpc('get_user_post_bookmarks', {
          user_id: user.id,
          post_ids: postIds
        });
        
      if (userBookmarksData && Array.isArray(userBookmarksData)) {
        userBookmarks = userBookmarksData.reduce((acc: Record<string, boolean>, bookmark: any) => {
          if (bookmark && typeof bookmark === 'object' && bookmark.post_id) {
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
    return posts.map((post: any) => ({
      ...post,
      votes_count: voteCounts[post.id] || 0,
      comments_count: commentCounts[post.id] || 0,
      user_has_voted: userVotes[post.id] || false,
      user_has_bookmarked: userBookmarks[post.id] || false
    }));
  };

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_all_tags')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error: any) {
      toast.error('Error loading tags: ' + error.message);
      console.error('Error loading tags:', error);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('post_files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post_files')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast.error('Error uploading file: ' + error.message);
      console.error('Error uploading file:', error);
      return null;
    }
  };

  const createPost = async (postData: PostFormData, file?: File): Promise<Post | null> => {
    if (!user) {
      toast.error('You must be logged in to create a post');
      return null;
    }

    try {
      let fileUrl = null;
      if (file && (postData.content_type === 'file' || postData.content_type === 'image')) {
        fileUrl = await uploadFile(file);
        if (!fileUrl) return null;
      }

      const newPost = {
        title: postData.title,
        content: postData.content,
        user_id: user.id,
        content_type: postData.content_type,
        file_url: fileUrl,
        link_url: postData.link_url || null,
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([newPost])
        .select()
        .single();

      if (error) throw error;

      // Add tags if any
      if (postData.tags && postData.tags.length > 0) {
        const tagInserts = postData.tags.map(tagId => ({
          post_id: data.id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from('post_tags')
          .insert(tagInserts);

        if (tagError) throw tagError;
      }

      toast.success('Post created successfully');
      await fetchPosts(); // Refresh posts
      return data;
    } catch (error: any) {
      toast.error('Error creating post: ' + error.message);
      console.error('Error creating post:', error);
      return null;
    }
  };

  const updatePost = async (id: string, postData: PostFormData, file?: File): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to update a post');
      return false;
    }

    try {
      const { data: existingPost, error: fetchError } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      if (!existingPost) {
        toast.error('Post not found or you do not have permission to edit it');
        return false;
      }

      let fileUrl = existingPost.file_url;
      if (file && (postData.content_type === 'file' || postData.content_type === 'image')) {
        const newFileUrl = await uploadFile(file);
        if (newFileUrl) fileUrl = newFileUrl;
      }

      const updateData = {
        title: postData.title,
        content: postData.content,
        content_type: postData.content_type,
        file_url: fileUrl,
        link_url: postData.link_url || null,
      };

      const { error: updateError } = await supabase
        .from('posts')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      // Update tags - first remove existing tags
      const { error: deleteTagError } = await supabase
        .from('post_tags')
        .delete()
        .eq('post_id', id);

      if (deleteTagError) throw deleteTagError;

      // Then add new tags
      if (postData.tags && postData.tags.length > 0) {
        const tagInserts = postData.tags.map(tagId => ({
          post_id: id,
          tag_id: tagId
        }));

        const { error: tagError } = await supabase
          .from('post_tags')
          .insert(tagInserts);

        if (tagError) throw tagError;
      }

      toast.success('Post updated successfully');
      await fetchPosts(); // Refresh posts
      return true;
    } catch (error: any) {
      toast.error('Error updating post: ' + error.message);
      console.error('Error updating post:', error);
      return false;
    }
  };

  const deletePost = async (id: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to delete a post');
      return false;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Post deleted successfully');
      await fetchPosts(); // Refresh posts
      return true;
    } catch (error: any) {
      toast.error('Error deleting post: ' + error.message);
      console.error('Error deleting post:', error);
      return false;
    }
  };

  const fetchPostById = async (id: string): Promise<Post | null> => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          user:user_id (
            full_name,
            avatar_url
          ),
          post_tags (
            tag:tag_id (
              id,
              name
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Transform post_tags to tags array
      const tags = data.post_tags.map((pt: any) => pt.tag);
      const post = { ...data, tags, post_tags: undefined };

      // Add votes and comments counts
      const enrichedPosts = await enrichPostsWithCounts([post]);
      return enrichedPosts[0] || null;
    } catch (error: any) {
      toast.error('Error fetching post: ' + error.message);
      console.error('Error fetching post:', error);
      return null;
    }
  };

  const fetchCommentsByPostId = async (postId: string): Promise<Comment[]> => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      toast.error('Error fetching comments: ' + error.message);
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const addComment = async (postId: string, content: string): Promise<Comment | null> => {
    if (!user) {
      toast.error('You must be logged in to comment');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            content,
            post_id: postId,
            user_id: user.id
          }
        ])
        .select(`
          *,
          user:user_id (
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      toast.success('Comment added');
      return data;
    } catch (error: any) {
      toast.error('Error adding comment: ' + error.message);
      console.error('Error adding comment:', error);
      return null;
    }
  };

  const deleteComment = async (id: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to delete a comment');
      return false;
    }

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      toast.success('Comment deleted');
      return true;
    } catch (error: any) {
      toast.error('Error deleting comment: ' + error.message);
      console.error('Error deleting comment:', error);
      return false;
    }
  };

  const upvotePost = async (postId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to vote');
      return false;
    }

    try {
      const { error } = await supabase
        .from('votes')
        .upsert({
          post_id: postId,
          user_id: user.id,
          is_upvote: true
        });

      if (error) throw error;
      await fetchPosts(); // Refresh posts to update counts
      return true;
    } catch (error: any) {
      toast.error('Error voting: ' + error.message);
      console.error('Error voting:', error);
      return false;
    }
  };

  const removeVote = async (postId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to remove a vote');
      return false;
    }

    try {
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchPosts(); // Refresh posts to update counts
      return true;
    } catch (error: any) {
      toast.error('Error removing vote: ' + error.message);
      console.error('Error removing vote:', error);
      return false;
    }
  };

  const bookmarkPost = async (postId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to bookmark');
      return false;
    }

    try {
      const { error } = await supabase
        .from('bookmarks')
        .insert({
          post_id: postId,
          user_id: user.id
        });

      if (error) throw error;
      await fetchPosts(); // Refresh posts to update state
      toast.success('Post bookmarked');
      return true;
    } catch (error: any) {
      toast.error('Error bookmarking post: ' + error.message);
      console.error('Error bookmarking post:', error);
      return false;
    }
  };

  const removeBookmark = async (postId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to remove a bookmark');
      return false;
    }

    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchPosts(); // Refresh posts to update state
      toast.success('Bookmark removed');
      return true;
    } catch (error: any) {
      toast.error('Error removing bookmark: ' + error.message);
      console.error('Error removing bookmark:', error);
      return false;
    }
  };

  const searchPosts = async ({ query, contentType, tag, featured }: SearchParams): Promise<Post[]> => {
    try {
      let supabaseQuery = supabase
        .from('posts')
        .select(`
          *,
          user:user_id (
            full_name,
            avatar_url
          ),
          post_tags!inner (
            tag:tag_id (
              id,
              name
            )
          )
        `)
        .eq('is_approved', true);
        
      // Add content_type filter if specified
      if (contentType && contentType !== 'all') {
        supabaseQuery = supabaseQuery.eq('content_type', contentType);
      }
      
      // Add tag filter if specified
      if (tag) {
        supabaseQuery = supabaseQuery
          .eq('post_tags.tag.id', tag);
      }
      
      // Add featured filter if specified
      if (featured) {
        supabaseQuery = supabaseQuery.eq('is_featured', true);
      }
      
      // Add search query if specified
      if (query) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      }
      
      const { data, error } = await supabaseQuery
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Process the results to transform post_tags to tags array
      const processedPosts = (data || []).map((post: any) => {
        const tags = post.post_tags.map((pt: any) => pt.tag);
        return { ...post, tags, post_tags: undefined };
      });
      
      // Remove duplicates (can happen due to joining with post_tags)
      const uniquePosts = Array.from(
        new Map(processedPosts.map((post: Post) => [post.id, post])).values()
      );
      
      const enrichedPosts = await enrichPostsWithCounts(uniquePosts);
      return enrichedPosts;
    } catch (error: any) {
      toast.error('Error searching posts: ' + error.message);
      console.error('Error searching posts:', error);
      return [];
    }
  };

  const createTag = async (name: string): Promise<Tag | null> => {
    if (!user) {
      toast.error('You must be logged in to create a tag');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchTags(); // Refresh tags
      return data;
    } catch (error: any) {
      // Check if it's a duplicate tag error
      if (error.code === '23505') {
        toast.error('This tag already exists');
      } else {
        toast.error('Error creating tag: ' + error.message);
      }
      console.error('Error creating tag:', error);
      return null;
    }
  };

  const refreshPosts = async () => {
    await fetchPosts();
  };

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
    refreshPosts,
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
