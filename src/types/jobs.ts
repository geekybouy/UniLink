
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type JobStatus = 'open' | 'closed' | 'filled';
export type ApplicationStatus = 'pending' | 'reviewed' | 'interviewing' | 'rejected' | 'accepted';
export type AlertFrequency = 'daily' | 'weekly';

export interface Company {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  company_id?: string;
  company?: Company;
  posted_by: string;
  poster?: {
    full_name: string;
    avatar_url?: string;
  };
  location: string;
  job_type: JobType;
  salary_range?: string;
  experience_level?: string;
  skills: string[];
  requirements?: string;
  benefits?: string;
  application_deadline?: string;
  status: JobStatus;
  created_at: string;
  updated_at: string;
  is_bookmarked?: boolean;
  applications_count?: number;
}

export interface JobFormData {
  title: string;
  description: string;
  company_id?: string;
  location: string;
  job_type: JobType;
  salary_range?: string;
  experience_level?: string;
  skills: string[];
  requirements?: string;
  benefits?: string;
  application_deadline?: Date;
  status: JobStatus;
}

export interface JobApplication {
  id: string;
  job_id: string;
  job?: Job;
  applicant_id: string;
  applicant?: {
    full_name: string;
    avatar_url?: string;
    email?: string;
  };
  resume_url?: string;
  cover_letter?: string;
  status: ApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface JobBookmark {
  id: string;
  job_id: string;
  user_id: string;
  job?: Job;
  created_at: string;
}

export interface JobAlert {
  id: string;
  user_id: string;
  job_type: JobType[];
  keywords: string[];
  locations: string[];
  frequency: AlertFrequency;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobFilters {
  search?: string;
  job_type?: JobType[];
  locations?: string[];
  company_id?: string;
  skills?: string[];
  experience_level?: string;
  posted_after?: Date;
}
