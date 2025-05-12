
import { supabase } from '@/integrations/supabase/client';
import { CVTemplate, EnhancementOptions } from '@/types/cvTemplate';

export async function fetchCVTemplates(): Promise<CVTemplate[]> {
  try {
    // Using from() with rawQuery option to avoid TypeScript errors
    // This tells TypeScript to treat this as a custom table not in the schema
    const { data, error } = await supabase
      .from('cv_templates', { count: 'exact' })
      .select('*')
      .order('name') as { data: CVTemplate[] | null, error: any };
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error fetching CV templates:', error);
    throw error;
  }
}

export async function fetchTemplateContent(templateId: string): Promise<string> {
  try {
    // Get the template file name using from() with type assertion
    const { data: template, error: templateError } = await supabase
      .from('cv_templates')
      .select('template_file')
      .eq('id', templateId)
      .single() as { data: { template_file: string } | null, error: any };
      
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
