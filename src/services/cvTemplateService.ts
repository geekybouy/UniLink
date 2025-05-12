
import { supabase } from '@/integrations/supabase/client';
import { CVTemplate, EnhancementOptions } from '@/types/cvTemplate';

export async function fetchCVTemplates(): Promise<CVTemplate[]> {
  try {
    // Use the RPC function we created
    const { data, error } = await supabase.rpc('get_cv_templates');
    
    if (error) throw error;
    
    // Cast the data to the CVTemplate type
    return (data || []) as CVTemplate[];
  } catch (error) {
    console.error('Error fetching CV templates:', error);
    throw error;
  }
}

export async function fetchTemplateContent(templateId: string): Promise<string> {
  try {
    // Use the RPC function we created to get template info
    const { data, error } = await supabase.rpc('get_cv_template_by_id', {
      template_id: templateId
    });
    
    if (error || !data || data.length === 0) throw new Error('Template not found');
    
    // The data is returned as an array, so take the first item
    const templateFile = data[0].template_file;
    
    const storageResponse = await supabase
      .storage
      .from('cv_files')
      .download(templateFile);
      
    if (storageResponse.error) throw storageResponse.error;
    
    return await storageResponse.data.text();
  } catch (error) {
    console.error('Error fetching template content:', error);
    throw error;
  }
}

export async function enhanceCV(cvData: any, enhancementOptions: EnhancementOptions) {
  try {
    const { data, error } = await supabase.functions.invoke('enhance-cv', {
      body: {
        cvData,
        enhancementOptions
      }
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error enhancing CV:', error);
    throw error;
  }
}
