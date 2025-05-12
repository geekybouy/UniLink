
import { supabase } from '@/integrations/supabase/client';
import { CVTemplate } from '@/types/cvTemplate';

export async function fetchCVTemplates(): Promise<CVTemplate[]> {
  try {
    // Need to use "from" with string parameter as the table isn't in generated types yet
    const { data, error } = await supabase
      .from('cv_templates')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    // Cast to CVTemplate[] since the table is new
    return data as unknown as CVTemplate[];
  } catch (error) {
    console.error('Error fetching CV templates:', error);
    throw error;
  }
}

export async function fetchTemplateContent(templateId: string): Promise<string> {
  try {
    // Need to use "from" with string parameter as the table isn't in generated types yet
    const { data: template, error: templateError } = await supabase
      .from('cv_templates')
      .select('template_file')
      .eq('id', templateId)
      .single();
      
    if (templateError || !template) throw new Error('Template not found');
    
    // Safely access the templateFile property with proper typecasting
    const templateFile = (template as unknown as { template_file: string }).template_file;
    
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
