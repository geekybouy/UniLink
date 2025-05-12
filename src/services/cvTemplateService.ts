
import { supabase } from '@/integrations/supabase/client';
import { CVTemplate, EnhancementOptions } from '@/types/cvTemplate';

export async function fetchCVTemplates(): Promise<CVTemplate[]> {
  try {
    // Use explicit type casting to handle the fact that cv_templates is not in the TypeScript schema
    const response = await supabase
      .from('cv_templates')
      .select('*')
      .order('name');
      
    if (response.error) throw response.error;
    
    // Cast the data to the CVTemplate type
    return (response.data || []) as unknown as CVTemplate[];
  } catch (error) {
    console.error('Error fetching CV templates:', error);
    throw error;
  }
}

export async function fetchTemplateContent(templateId: string): Promise<string> {
  try {
    // Get the template file name with type assertion
    const templateResponse = await supabase
      .from('cv_templates')
      .select('template_file')
      .eq('id', templateId)
      .single();
      
    if (templateResponse.error || !templateResponse.data) throw new Error('Template not found');
    
    const templateFile = (templateResponse.data as unknown as { template_file: string }).template_file;
    
    const { data, error } = await supabase
      .storage
      .from('cv_files')
      .download(templateFile);
      
    if (error) throw error;
    
    return await data.text();
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
