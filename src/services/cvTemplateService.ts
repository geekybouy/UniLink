
import { supabase } from '@/integrations/supabase/client';
import { CVTemplate, EnhancementOptions } from '@/types/cvTemplate';

export async function fetchCVTemplates(): Promise<CVTemplate[]> {
  try {
    // Use a raw SQL query instead of RPC to avoid type issues
    const { data, error } = await supabase
      .from('cv_templates')
      .select('*') as { data: CVTemplate[] | null, error: any };
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching CV templates:', error);
    throw error;
  }
}

export async function fetchTemplateContent(templateId: string): Promise<string> {
  try {
    // Get the template file name
    const { data, error } = await supabase
      .from('cv_templates')
      .select('template_file')
      .eq('id', templateId)
      .single() as { data: { template_file: string } | null, error: any };
    
    if (error || !data) throw new Error('Template not found');
    
    const templateFile = data.template_file;
    
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
