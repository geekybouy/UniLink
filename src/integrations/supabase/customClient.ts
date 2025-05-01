
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
    delete: (id: string) => customSupabase.from('education').delete().eq('id', id)
  },
  // Skills table
  skills: {
    insert: (data: any) => customSupabase.from('skills').insert(data),
    select: () => customSupabase.from('skills').select('*'),
    update: (id: string, data: any) => customSupabase.from('skills').update(data).eq('id', id),
    delete: (id: string) => customSupabase.from('skills').delete().eq('id', id)
  },
  // Social links table
  socialLinks: {
    insert: (data: any) => customSupabase.from('social_links').insert(data),
    select: () => customSupabase.from('social_links').select('*'),
    update: (id: string, data: any) => customSupabase.from('social_links').update(data).eq('id', id),
    delete: (id: string) => customSupabase.from('social_links').delete().eq('id', id)
  },
  // Work experience table
  workExperience: {
    insert: (data: any) => customSupabase.from('work_experience').insert(data),
    select: () => customSupabase.from('work_experience').select('*'),
    update: (id: string, data: any) => customSupabase.from('work_experience').update(data).eq('id', id),
    delete: (id: string) => customSupabase.from('work_experience').delete().eq('id', id)
  },
  // Profiles table with additional methods
  profiles: {
    insert: (data: any) => customSupabase.from('profiles').insert(data),
    select: () => customSupabase.from('profiles').select('*'),
    update: (userId: string, data: any) => customSupabase.from('profiles').update(data).eq('user_id', userId),
    getByUserId: (userId: string) => customSupabase.from('profiles').select('*').eq('user_id', userId).single()
  }
};
