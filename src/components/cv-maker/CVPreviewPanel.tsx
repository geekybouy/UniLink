
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CVData } from '@/types/cv';
import { CVTemplate } from '@/types/cvTemplate';
import { fetchTemplateContent } from '@/services/cvTemplateService';
import { toast } from 'sonner';

interface CVPreviewPanelProps {
  cvData: CVData;
  selectedTemplate: CVTemplate | null;
  isEnhanced: boolean;
}

export function CVPreviewPanel({ cvData, selectedTemplate, isEnhanced }: CVPreviewPanelProps) {
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [generatingDocx, setGeneratingDocx] = useState<boolean>(false);
  
  useEffect(() => {
    async function loadTemplatePreview() {
      if (!selectedTemplate) return;
      
      try {
        setLoading(true);
        const templateContent = await fetchTemplateContent(selectedTemplate.id);
        
        // Here we would normally inject the CV data into the template
        // For demo purposes we'll just show the template with placeholder text
        setPreviewHtml(templateContent);
      } catch (error) {
        console.error('Error loading template preview:', error);
        toast.error('Failed to load template preview');
      } finally {
        setLoading(false);
      }
    }
    
    loadTemplatePreview();
  }, [selectedTemplate, cvData, isEnhanced]);
  
  const handleDownloadPdf = async () => {
    try {
      setGeneratingPdf(true);
      // Simulate PDF generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('CV downloaded successfully as PDF');
    } catch (error) {
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };
  
  const handleDownloadDocx = async () => {
    try {
      setGeneratingDocx(true);
      // Simulate DOCX generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('CV downloaded successfully as DOCX');
    } catch (error) {
      toast.error('Failed to generate DOCX');
    } finally {
      setGeneratingDocx(false);
    }
  };
  
  if (!selectedTemplate) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed rounded-md">
        <p className="text-muted-foreground">Select a template to preview your CV</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">CV Preview</h3>
      
      <div className="flex justify-end space-x-2 mb-2">
        <Button 
          variant="outline" 
          onClick={handleDownloadDocx} 
          disabled={loading || generatingDocx}
        >
          {generatingDocx ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              <span>Generating DOCX</span>
            </>
          ) : (
            'Download DOCX'
          )}
        </Button>
        <Button 
          onClick={handleDownloadPdf} 
          disabled={loading || generatingPdf}
        >
          {generatingPdf ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              <span>Generating PDF</span>
            </>
          ) : (
            'Download PDF'
          )}
        </Button>
      </div>
      
      <div className="border rounded-md overflow-hidden bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Spinner className="h-8 w-8" />
            <span className="ml-2">Loading preview...</span>
          </div>
        ) : (
          <div className="h-[600px] overflow-auto p-4 shadow-inner">
            <div 
              className="bg-white mx-auto max-w-[800px]"
              dangerouslySetInnerHTML={{ __html: previewHtml }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
