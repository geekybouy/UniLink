
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { CVData } from '@/types/cv';
import { CVTemplate } from '@/types/cvTemplate';
import { useDownloadCV } from '@/hooks/use-download-cv';
import { Download, FileText } from 'lucide-react';

interface DownloadActionsProps {
  selectedTemplate: CVTemplate | null;
  cvData: CVData;
  loading: boolean;
  generatingPdf: boolean;
  setGeneratingPdf: (value: boolean) => void;
  generatingDocx: boolean;
  setGeneratingDocx: (value: boolean) => void;
}

export function DownloadActions({ 
  selectedTemplate, 
  cvData, 
  loading,
  generatingPdf,
  setGeneratingPdf,
  generatingDocx,
  setGeneratingDocx
}: DownloadActionsProps) {
  const { handleDownloadPdf, handleDownloadDocx } = useDownloadCV({
    cvData,
    selectedTemplate,
    setGeneratingPdf,
    setGeneratingDocx
  });

  return (
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
          <>
            <FileText className="mr-2 h-4 w-4" />
            <span>Download DOCX</span>
          </>
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
          <>
            <Download className="mr-2 h-4 w-4" />
            <span>Download PDF</span>
          </>
        )}
      </Button>
    </div>
  );
}
