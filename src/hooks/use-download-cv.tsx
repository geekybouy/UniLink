
import { useState } from 'react';
import { CVData } from '@/types/cv';
import { CVTemplate } from '@/types/cvTemplate';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface UseDownloadCVProps {
  cvData: CVData;
  selectedTemplate: CVTemplate | null;
  setGeneratingPdf: (value: boolean) => void;
  setGeneratingDocx: (value: boolean) => void;
}

export function useDownloadCV({
  cvData,
  selectedTemplate,
  setGeneratingPdf,
  setGeneratingDocx
}: UseDownloadCVProps) {
  
  const handleDownloadPdf = async () => {
    if (!selectedTemplate) return;
    
    try {
      setGeneratingPdf(true);
      
      // In a real implementation, we'd generate a proper PDF with the template layout
      // For this demo, we'll use html2canvas and jsPDF
      const previewElement = document.getElementById('cv-preview');
      if (!previewElement) {
        throw new Error('Preview element not found');
      }
      
      const canvas = await html2canvas(previewElement);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${cvData.fullName || 'CV'}.pdf`);
      
      toast.success('CV downloaded successfully as PDF');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };
  
  const handleDownloadDocx = async () => {
    if (!selectedTemplate) return;
    
    try {
      setGeneratingDocx(true);
      
      // In a real implementation, we'd generate a proper DOCX with the template layout
      // For this demo, we'll just simulate a download
      
      // Simulate DOCX generation delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('CV downloaded successfully as DOCX');
      toast.info('Note: This is a simulated download. In a production app, a properly formatted DOCX would be generated.');
    } catch (error) {
      console.error('Error generating DOCX:', error);
      toast.error('Failed to generate DOCX');
    } finally {
      setGeneratingDocx(false);
    }
  };
  
  return { handleDownloadPdf, handleDownloadDocx };
}
