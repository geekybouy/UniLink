
import { supabase } from '@/integrations/supabase/client';
import { CVTemplate } from '@/types/cvTemplate';

export async function fetchCVTemplates(): Promise<CVTemplate[]> {
  try {
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
    const { data: template } = await supabase
      .from('cv_templates')
      .select('templateFile')
      .eq('id', templateId)
      .single();
      
    if (!template) throw new Error('Template not found');
    
    const { data, error } = await supabase
      .storage
      .from('cv_files')
      .download(template.templateFile);
      
    if (error) throw error;
    
    return await data.text();
  } catch (error) {
    console.error('Error fetching template content:', error);
    throw error;
  }
}

export async function enhanceCV(cvData: any, enhancementOptions: any) {
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
