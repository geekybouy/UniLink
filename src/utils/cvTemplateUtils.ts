
import { CVData } from '@/types/cv';

export const injectDataIntoTemplate = (html: string, data: CVData): string => {
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
