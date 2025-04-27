
import { Json } from "@/integrations/supabase/types";

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
}

export interface CVData {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  education: Education[];
  workExperience: WorkExperience[];
  projects: Project[];
  skills: string[] | string;
  certifications: string[] | string;
}

// This type helps ensure our CVData can be stored in Supabase's Json column
export type SerializableCVData = {
  [K in keyof CVData]: CVData[K];
}
