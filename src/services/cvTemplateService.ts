
import { supabase } from '@/integrations/supabase/client';
import { CVTemplate, EnhancementOptions } from '@/types/cvTemplate';

export async function fetchCVTemplates(): Promise<CVTemplate[]> {
  try {
    // Use a raw query with rpc to avoid TypeScript errors since cv_templates isn't in the TypeScript schema
    const { data, error } = await supabase
      .rpc('get_cv_templates')
      .returns<CVTemplate[]>();
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching CV templates:', error);
    throw error;
  }
}

export async function fetchTemplateContent(templateId: string): Promise<string> {
  try {
    // Use a raw query with rpc to get the template file name
    const { data: template, error: templateError } = await supabase
      .rpc('get_cv_template_by_id', { template_id: templateId })
      .returns<{template_file: string}>();
      
    if (templateError || !template) throw new Error('Template not found');
    
    const templateFile = template.template_file;
    
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
