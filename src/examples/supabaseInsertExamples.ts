
// Import the supabase client!
import { supabase } from "@/integrations/supabase/client";

/**
 * Supabase Insert Examples for "profiles", "job_board", and "posts"
 * 
 * These are ready to use in your project with:
 *   import { supabase } from "@/integrations/supabase/client";
 */

// 1. Insert into "profiles" (after user signup)
export async function insertProfile(user: { id: string; email: string }, fullName: string, domain?: string) {
  // user.id comes from Supabase Auth user (auth.users)
  const { data, error } = await supabase
    .from("profiles")
    .insert([
      {
        user_id: user.id,
        full_name: fullName,
        email: user.email,
        domain: domain ?? null
      }
    ]);
  if (error) throw error;
  return data;
}

// Example usage after signup
// const user = { id: supabaseUser.id, email: supabaseUser.email };
// await insertProfile(user, "Jane Doe", "mydomain.com");

// 2. Insert a job into "job_board"
export async function insertJob(userId: string, title: string, company: string, location?: string, description?: string) {
  const { data, error } = await supabase
    .from("job_board")
    .insert([
      {
        user_id: userId,
        title,
        company,
        location: location ?? null,
        description: description ?? null
      }
    ]);
  if (error) throw error;
  return data;
}

// Example:
// await insertJob(user.id, "Frontend Engineer", "StartupX", "Remote", "Work on modern React apps.");

// 3. Insert a post into "posts"
export async function insertPost(userId: string, title: string, content: string, imageUrl?: string) {
  const { data, error } = await supabase
    .from("posts")
    .insert([
      {
        user_id: userId,
        title: title ?? null,
        content,
        image_url: imageUrl ?? null
      }
    ]);
  if (error) throw error;
  return data;
}

// Example:
// await insertPost(user.id, "Hello, world!", "This is a new post.", null);

