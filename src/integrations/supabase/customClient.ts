
import { createClient } from '@supabase/supabase-js';

// Get the URL and key from the existing client
const SUPABASE_URL = "https://tchudsedvmebjqzewlyb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjaHVkc2Vkdm1lYmpxemV3bHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NTEzMDMsImV4cCI6MjA2MTIyNzMwM30.SPrcFlHeSyEkhlL7eituhogjR4WjaCuLXhl3UUk7-JQ";

export const customSupabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});

// Simpler typed client without excessive generics that can cause type instantiation issues
export const typedSupabaseClient = {
  // Education table
  education: {
    insert: (data: any) => customSupabase.from('education').insert(data),
    select: () => customSupabase.from('education').select('*'),
    update: (id: string, data: any) => customSupabase.from('education').update(data).eq('id', id),
    delete: (id: string) => customSupabase.from('education').delete().eq('id', id),
    getByUserId: (userId: string) => customSupabase.from('education').select('*').eq('user_id', userId)
  },
  
  // Posts table with specific methods for schema-aware operations
  posts: {
    select: () => customSupabase.from('posts').select('*'),
    selectWithUser: () => customSupabase.from('posts').select('*, user:profiles (full_name, avatar_url)'),
    insert: (data: any) => customSupabase.from('posts').insert(data),
    update: (id: string, data: any) => customSupabase.from('posts').update(data).eq('id', id),
    delete: (id: string) => customSupabase.from('posts').delete().eq('id', id),
    getById: (id: string) => customSupabase.from('posts').select('*').eq('id', id).single(),
    getByUserId: (userId: string) => customSupabase.from('posts').select('*').eq('user_id', userId),
    getFeatured: () => customSupabase.from('posts').select('*').eq('is_featured', true),
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
  
  // Votes, comments, and other interactive tables
  votes: {
    select: () => customSupabase.from('votes').select('*'),
    count: (postId: string) => customSupabase.from('votes').select('id', { count: 'exact' }).eq('post_id', postId),
    getByUser: (userId: string) => customSupabase.from('votes').select('post_id').eq('user_id', userId),
  },
  
  comments: {
    select: () => customSupabase.from('comments').select('*'),
    count: (postId: string) => customSupabase.from('comments').select('id', { count: 'exact' }).eq('post_id', postId),
    getByPostId: (postId: string) => customSupabase.from('comments').select('*').eq('post_id', postId),
  },
  
  bookmarks: {
    select: () => customSupabase.from('bookmarks').select('*'),
    getByUser: (userId: string) => customSupabase.from('bookmarks').select('post_id').eq('user_id', userId),
  }
};
