
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Get the URL and key from the existing client
const SUPABASE_URL = "https://tchudsedvmebjqzewlyb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjaHVkc2Vkdm1lYmpxemV3bHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTEzMDMsImV4cCI6MjA2MTIyNzMwM30.SPrcFlHeSyEkhlL7eituhogjR4WjaCuLXhl3UUk7-JQ";

export const customSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Use this for any custom table queries that aren't yet defined in the types
export const typedSupabaseClient = {
  // Education table
  education: {
    insert: (data: any) => customSupabase.from('education').insert(data),
    select: () => customSupabase.from('education').select('*'),
    update: (id: string, data: any) => customSupabase.from('education').update(data).eq('id', id),
    delete: (id: string) => customSupabase.from('education').delete().eq('id', id),
    getByUserId: (userId: string) => customSupabase.from('education').select('*').eq('user_id', userId)
  },
  // Skills table
  skills: {
    insert: (data: any) => customSupabase.from('skills').insert(data),
    select: () => customSupabase.from('skills').select('*'),
    update: (id: string, data: any) => customSupabase.from('skills').update(data).eq('id', id),
    delete: (id: string) => customSupabase.from('skills').delete().eq('id', id),
    getByUserId: (userId: string) => customSupabase.from('skills').select('*').eq('user_id', userId)
  },
  // Social links table
  socialLinks: {
    insert: (data: any) => customSupabase.from('social_links').insert(data),
    select: () => customSupabase.from('social_links').select('*'),
    update: (id: string, data: any) => customSupabase.from('social_links').update(data).eq('id', id),
    delete: (id: string) => customSupabase.from('social_links').delete().eq('id', id),
    getByUserId: (userId: string) => customSupabase.from('social_links').select('*').eq('user_id', userId)
  },
  // Work experience table
  workExperience: {
    insert: (data: any) => customSupabase.from('work_experience').insert(data),
    select: () => customSupabase.from('work_experience').select('*'),
    update: (id: string, data: any) => customSupabase.from('work_experience').update(data).eq('id', id),
    delete: (id: string) => customSupabase.from('work_experience').delete().eq('id', id),
    getByUserId: (userId: string) => customSupabase.from('work_experience').select('*').eq('user_id', userId)
  },
  // Profiles table with additional methods
  profiles: {
    insert: (data: any) => customSupabase.from('profiles').insert(data),
    select: () => customSupabase.from('profiles').select('*'),
    update: (userId: string, data: any) => customSupabase.from('profiles').update(data).eq('user_id', userId),
    getByUserId: (userId: string) => customSupabase.from('profiles').select('*').eq('user_id', userId).single()
  },
  // Messages table
  messages: {
    insert: (data: any) => customSupabase.from('messages').insert(data),
    select: () => customSupabase.from('messages').select('*'),
    getByConversationId: (conversationId: string, limit = 20, offset = 0) => {
      return customSupabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    },
    markAsRead: (messageId: string) => {
      return customSupabase
        .from('messages')
        .update({ is_read: true, status: 'read' })
        .eq('id', messageId);
    },
    markAllAsReadInConversation: (conversationId: string, userId: string) => {
      return customSupabase
        .from('messages')
        .update({ is_read: true, status: 'read' })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', userId)
        .eq('is_read', false);
    }
  },
  // Conversations table
  conversations: {
    insert: (data: any) => customSupabase.from('conversations').insert(data),
    select: () => customSupabase.from('conversations').select('*'),
    getByUserId: (userId: string) => {
      return customSupabase
        .from('conversations')
        .select('*')
        .or(`participant1_id.eq.${userId},participant2_id.eq.${userId}`)
        .order('updated_at', { ascending: false });
    },
    getByParticipants: (userId1: string, userId2: string) => {
      return customSupabase
        .from('conversations')
        .select('*')
        .or(`and(participant1_id.eq.${userId1},participant2_id.eq.${userId2}),and(participant1_id.eq.${userId2},participant2_id.eq.${userId1})`)
        .single();
    }
  },
  // User presence
  userPresence: {
    update: (userId: string, status: boolean) => {
      return customSupabase
        .from('user_presence')
        .upsert(
          {
            user_id: userId,
            online_status: status,
            last_seen_at: new Date().toISOString()
          },
          { onConflict: 'user_id' }
        );
    },
    getOnlineStatus: (userId: string) => {
      return customSupabase
        .from('user_presence')
        .select('online_status')
        .eq('user_id', userId)
        .single();
    }
  },
  // Knowledge Hub tables
  posts: {
    insert: (data: any) => customSupabase.from('posts').insert(data),
    select: () => customSupabase.from('posts').select('*'),
    getById: (id: string) => customSupabase.from('posts').select('*').eq('id', id).single(),
    update: (id: string, data: any) => customSupabase.from('posts').update(data).eq('id', id),
    delete: (id: string) => customSupabase.from('posts').delete().eq('id', id),
    getByUserId: (userId: string) => customSupabase.from('posts').select('*').eq('user_id', userId),
    getFeatured: () => customSupabase.from('posts').select('*').eq('is_featured', true)
  },
  comments: {
    insert: (data: any) => customSupabase.from('comments').insert(data),
    select: () => customSupabase.from('comments').select('*'),
    getByPostId: (postId: string) => customSupabase.from('comments').select('*').eq('post_id', postId),
    delete: (id: string) => customSupabase.from('comments').delete().eq('id', id)
  },
  votes: {
    insert: (data: any) => customSupabase.from('votes').insert(data),
    select: () => customSupabase.from('votes').select('*'),
    delete: (userId: string, postId: string) => customSupabase.from('votes').delete().eq('user_id', userId).eq('post_id', postId),
    getByPostId: (postId: string) => customSupabase.from('votes').select('*').eq('post_id', postId),
    getUserVote: (userId: string, postId: string) => customSupabase.from('votes').select('*').eq('user_id', userId).eq('post_id', postId).single()
  },
  bookmarks: {
    insert: (data: any) => customSupabase.from('bookmarks').insert(data),
    select: () => customSupabase.from('bookmarks').select('*'),
    delete: (userId: string, postId: string) => customSupabase.from('bookmarks').delete().eq('user_id', userId).eq('post_id', postId),
    getByUserId: (userId: string) => customSupabase.from('bookmarks').select('*').eq('user_id', userId)
  },
  tags: {
    insert: (data: any) => customSupabase.from('tags').insert(data),
    select: () => customSupabase.from('tags').select('*')
  },
  postTags: {
    insert: (data: any) => customSupabase.from('post_tags').insert(data),
    select: () => customSupabase.from('post_tags').select('*'),
    deleteByPostId: (postId: string) => customSupabase.from('post_tags').delete().eq('post_id', postId)
  }
};
