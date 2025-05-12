
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CVData } from '@/types/cv';
import { CVTemplate } from '@/types/cvTemplate';
import { fetchTemplateContent } from '@/services/cvTemplateService';
import { toast } from 'sonner';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
  }, [selectedTemplate, cvData, isEnhanced]);
  
  const injectDataIntoTemplate = (html: string, data: CVData): string => {
    // Basic placeholder replacement - in a real implementation, this would be more sophisticated
    // based on the structure of your templates
    let result = html;
    
    // Personal information
    result = result.replace(/\{\{name\}\}/g, data.fullName || '');
    result = result.replace(/\{\{email\}\}/g, data.email || '');
    result = result.replace(/\{\{phone\}\}/g, data.phone || '');
    result = result.replace(/\{\{linkedin\}\}/g, data.linkedin || '');
    
    // Education
    if (data.education && data.education.length > 0) {
      // Create education section HTML
      let educationHtml = '';
      data.education.forEach(edu => {
        educationHtml += `
          <div class="education-item">
            <div class="edu-header">
              <strong>${edu.institution}</strong>
              <span>${edu.startDate} - ${edu.endDate}</span>
            </div>
            <div>${edu.degree} in ${edu.fieldOfStudy}</div>
            ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
          </div>
        `;
      });
      result = result.replace(/\{\{education\}\}/g, educationHtml);
    }
    
    // Work experience
    if (data.workExperience && data.workExperience.length > 0) {
      // Create work experience section HTML
      let workHtml = '';
      data.workExperience.forEach(exp => {
        let bulletPoints = '';
        if (Array.isArray(exp.description)) {
          bulletPoints = '<ul>' + 
            exp.description.map(bullet => `<li>${bullet}</li>`).join('') + 
            '</ul>';
        }
        
        workHtml += `
          <div class="work-item">
            <div class="work-header">
              <strong>${exp.company}</strong>
              <span>${exp.startDate} - ${exp.endDate}</span>
            </div>
            <div><em>${exp.position}</em></div>
            ${bulletPoints}
          </div>
        `;
      });
      result = result.replace(/\{\{work_experience\}\}/g, workHtml);
    }
    
    // Projects
    if (data.projects && data.projects.length > 0) {
      // Create projects section HTML
      let projectsHtml = '';
      data.projects.forEach(project => {
        projectsHtml += `
          <div class="project-item">
            <strong>${project.name}</strong>
            <div>${project.description}</div>
            <div><small>Technologies: ${Array.isArray(project.technologies) ? project.technologies.join(', ') : project.technologies}</small></div>
          </div>
        `;
      });
      result = result.replace(/\{\{projects\}\}/g, projectsHtml);
    }
    
    // Skills
    if (data.skills) {
      const skillsStr = Array.isArray(data.skills) ? data.skills.join(', ') : data.skills;
      result = result.replace(/\{\{skills\}\}/g, skillsStr);
    }
    
    // Certifications
    if (data.certifications) {
      const certsStr = Array.isArray(data.certifications) ? 
        data.certifications.join(', ') : 
        data.certifications;
      result = result.replace(/\{\{certifications\}\}/g, certsStr);
    }
    
    // For demo purposes, we'll add a disclaimer about the preview
    result += `
      <div class="cv-preview-note" style="margin-top: 20px; padding: 10px; background-color: #f0f0f0; border: 1px solid #ddd; border-radius: 4px;">
        <p><strong>Preview Note:</strong> This is a simplified preview. When exported, your CV will maintain the exact template layout and formatting.</p>
      </div>
    `;
    
    return result;
  };
  
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
              id="cv-preview"
              className="bg-white mx-auto max-w-[800px]"
              dangerouslySetInnerHTML={{ __html: previewHtml }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
