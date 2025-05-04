
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tag } from '@/types/knowledge';

// Fetch all tags
export const fetchTags = async (): Promise<Tag[]> => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error: any) {
    toast.error('Error loading tags: ' + error.message);
    console.error('Error loading tags:', error);
    return [];
  }
};

// Create a new tag
export const createTag = async (name: string, userId: string | undefined): Promise<Tag | null> => {
  if (!userId) {
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
    
    return data as Tag;
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
