
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Upload a file to Supabase storage
export const uploadFile = async (file: File): Promise<string | null> => {
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
