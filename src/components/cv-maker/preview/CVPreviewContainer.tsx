
import { useState } from 'react';
import { CVData } from '@/types/cv';
import { CVTemplate } from '@/types/cvTemplate';
import { PreviewHeader } from './PreviewHeader';
import { PreviewContent } from './PreviewContent';
import { DownloadActions } from './DownloadActions';

interface CVPreviewContainerProps {
  cvData: CVData;
  selectedTemplate: CVTemplate | null;
  isEnhanced: boolean;
}

export function CVPreviewContainer({ cvData, selectedTemplate, isEnhanced }: CVPreviewContainerProps) {
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [generatingDocx, setGeneratingDocx] = useState<boolean>(false);
  
  if (!selectedTemplate) {
    return (
      <div className="flex items-center justify-center h-64 border border-dashed rounded-md">
        <p className="text-muted-foreground">Select a template to preview your CV</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <PreviewHeader />
      
      <DownloadActions 
        selectedTemplate={selectedTemplate}
        cvData={cvData}
        loading={loading}
        generatingPdf={generatingPdf}
        setGeneratingPdf={setGeneratingPdf}
        generatingDocx={generatingDocx}
        setGeneratingDocx={setGeneratingDocx}
      />
      
      <PreviewContent 
        cvData={cvData}
        selectedTemplate={selectedTemplate}
        isEnhanced={isEnhanced}
        previewHtml={previewHtml}
        setPreviewHtml={setPreviewHtml}
        loading={loading}
        setLoading={setLoading}
      />
    </div>
  );
}
