
import { supabase } from '@/integrations/supabase/client';
import { CVTemplate, EnhancementOptions } from '@/types/cvTemplate';

export async function fetchCVTemplates(): Promise<CVTemplate[]> {
  try {
    // Use a raw query to select from cv_templates since it's not in the TypeScript schema yet
    const { data, error } = await supabase
      .from('cv_templates')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return data as CVTemplate[];
  } catch (error) {
    console.error('Error fetching CV templates:', error);
    throw error;
  }
}

export async function fetchTemplateContent(templateId: string): Promise<string> {
  try {
    // Use a raw query to select from cv_templates
    const { data: template, error: templateError } = await supabase
      .from('cv_templates')
      .select('template_file')
      .eq('id', templateId)
      .single();
      
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
