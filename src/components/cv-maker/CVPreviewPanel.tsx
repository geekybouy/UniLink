
import { CVData } from '@/types/cv';
import { CVTemplate } from '@/types/cvTemplate';
import { CVPreviewContainer } from './preview/CVPreviewContainer';

interface CVPreviewPanelProps {
  cvData: CVData;
  selectedTemplate: CVTemplate | null;
  isEnhanced: boolean;
}

export function CVPreviewPanel({ cvData, selectedTemplate, isEnhanced }: CVPreviewPanelProps) {
  return (
    <CVPreviewContainer
      cvData={cvData}
      selectedTemplate={selectedTemplate}
      isEnhanced={isEnhanced}
    />
  );
}
