
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { CVData } from '@/types/cv';
import { CVTemplate } from '@/types/cvTemplate';
import { fetchTemplateContent } from '@/services/cvTemplateService';
import { injectDataIntoTemplate } from '@/utils/cvTemplateUtils';
import mammoth from 'mammoth';
import { toast } from 'sonner';

interface PreviewContentProps {
  cvData: CVData;
  selectedTemplate: CVTemplate | null;
  isEnhanced: boolean;
  previewHtml: string;
  setPreviewHtml: (html: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export function PreviewContent({
  cvData,
  selectedTemplate,
  isEnhanced,
  previewHtml,
  setPreviewHtml,
  loading,
  setLoading,
}: PreviewContentProps) {
  useEffect(() => {
    async function loadTemplatePreview() {
      if (!selectedTemplate) return;
      
      try {
        setLoading(true);
        const templateContent = await fetchTemplateContent(selectedTemplate.id);
        
        // Convert template to HTML if it's a .docx file
        let htmlContent = templateContent;
        if (selectedTemplate.template_file.endsWith('.docx')) {
          try {
            // For demo purposes only - in production we'd need server-side processing
            // as browser-side .docx parsing is limited
            const result = await mammoth.convertToHtml({ arrayBuffer: new TextEncoder().encode(templateContent) });
            htmlContent = result.value;
          } catch (docxError) {
            console.error('Error converting DOCX to HTML:', docxError);
            // Fallback to a basic HTML representation
            htmlContent = `<div class="docx-warning">This is a DOCX template preview. The actual CV will maintain the template's formatting.</div>`;
          }
        }
        
        // Here we would inject the CV data into the template
        const populatedHtml = injectDataIntoTemplate(htmlContent, cvData);
        setPreviewHtml(populatedHtml);
      } catch (error) {
        console.error('Error loading template preview:', error);
        toast.error('Failed to load template preview');
      } finally {
        setLoading(false);
      }
    }
    
    loadTemplatePreview();
  }, [selectedTemplate, cvData, isEnhanced, setPreviewHtml, setLoading]);

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <Spinner className="h-8 w-8" />
          <span className="ml-2">Loading preview...</span>
        </div>
      ) : (
        <div className="h-[600px] overflow-auto p-4 shadow-inner">
          <div 
            id="cv-preview"
            className="bg-white mx-auto max-w-[800px]"
            dangerouslySetInnerHTML={{ __html: previewHtml }} 
          />
        </div>
      )}
    </div>
  );
}
