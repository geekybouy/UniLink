import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Job, JobFormData, JobApplication, JobBookmark, 
  JobAlert, Company, JobFilters, JobType, ApplicationStatus, AlertFrequency
} from '@/types/jobs';
import { useAuth } from './AuthContext';
import { useProfile } from './ProfileContext';

interface JobsContextType {
  jobs: Job[];
  featuredJobs: Job[];
  bookmarkedJobs: Job[];
  userApplications: JobApplication[];
  loading: boolean;
  fetchJobs: (filters?: JobFilters) => Promise<Job[]>;
  fetchJobById: (id: string) => Promise<Job | null>;
  createJob: (jobData: JobFormData) => Promise<Job | null>;
  updateJob: (id: string, jobData: JobFormData) => Promise<Job | null>;
  deleteJob: (id: string) => Promise<boolean>;
  bookmarkJob: (jobId: string) => Promise<boolean>;
  removeBookmark: (jobId: string) => Promise<boolean>;
  isJobBookmarked: (jobId: string) => boolean;
  fetchCompanies: () => Promise<Company[]>;
  createCompany: (company: Partial<Company>) => Promise<Company | null>;
  applyToJob: (jobId: string, application: { resume_url?: string, cover_letter?: string }) => Promise<JobApplication | null>;
  fetchUserApplications: () => Promise<JobApplication[]>;
  updateApplicationStatus: (applicationId: string, status: string) => Promise<boolean>;
  fetchApplicationsForJob: (jobId: string) => Promise<JobApplication[]>;
  createJobAlert: (alert: Omit<JobAlert, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<JobAlert | null>;
  fetchUserJobAlerts: () => Promise<JobAlert[]>;
  updateJobAlert: (alertId: string, data: Partial<JobAlert>) => Promise<boolean>;
  deleteJobAlert: (alertId: string) => Promise<boolean>;
}

const JobsContext = createContext<JobsContextType | undefined>(undefined);

export function JobsProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Job[]>([]);
  const [userApplications, setUserApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchUserBookmarks();
      fetchUserApplications();
    }
  }, [user]);

  const transformJobs = async (jobsData: any[]): Promise<Job[]> => {
    // If there are no jobs, return empty array
    if (!jobsData || !jobsData.length) return [];
    
    const bookmarkedJobIds = new Set<string>();
    
    if (user) {
      const { data: bookmarks } = await supabase
        .from('job_bookmarks')
        .select('job_id')
        .eq('user_id', user.id);
        
      if (bookmarks) {
        bookmarks.forEach(bookmark => bookmarkedJobIds.add(bookmark.job_id));
      }
    }
    
    return jobsData.map(job => {
      // If demo job with applications_count as [{ count: number }]
      let applications_count = 0;
      if (Array.isArray(job.applications_count) && job.applications_count.length > 0) {
        // For demo/fake: [{ count: X }]
        if (typeof job.applications_count[0].count === "number") {
          applications_count = job.applications_count[0].count;
        }
      }
      // Handle company data if it exists
      let company = undefined;
      if (job.company && typeof job.company === 'object') {
        company = job.company;
      }
      // Handle poster data if it exists
      let poster = {
        full_name: 'Unknown',
        avatar_url: undefined as string | undefined
      };
      if (job.poster && typeof job.poster === 'object') {
        if ('full_name' in job.poster && typeof job.poster.full_name === 'string') {
          poster.full_name = job.poster.full_name;
        }
        if ('avatar_url' in job.poster) {
          poster.avatar_url = job.poster.avatar_url as string | undefined;
        }
      }
      return {
        ...job,
        company,
        poster,
        applications_count,
        is_bookmarked: bookmarkedJobIds.has(job.id)
      };
    });
  };

  const fetchJobs = async (filters?: JobFilters): Promise<Job[]> => {
    try {
      setLoading(true);
      let query = supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*),
          poster:profiles!jobs_posted_by_fkey(full_name, avatar_url),
          applications_count:job_applications(count)
        `)
        .eq('status', 'open');
      
      // Apply filters if they exist
      if (filters) {
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }
        
        if (filters.job_type && filters.job_type.length > 0) {
          query = query.in('job_type', filters.job_type);
        }
        
        if (filters.locations && filters.locations.length > 0) {
          const locationConditions = filters.locations.map(location => `location.ilike.%${location}%`).join(',');
          query = query.or(locationConditions);
        }
        
        if (filters.company_id) {
          query = query.eq('company_id', filters.company_id);
        }
        
        if (filters.experience_level) {
          query = query.eq('experience_level', filters.experience_level);
        }
        
        if (filters.posted_after) {
          query = query.gte('created_at', filters.posted_after.toISOString());
        }
        
        // Skills filtering is a bit more complex for array columns
        if (filters.skills && filters.skills.length > 0) {
          // We need to use containedBy for array comparison
          // This checks if the job's skills array contains ANY of the filtered skills
          query = query.overlaps('skills', filters.skills);
        }
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      let jobsResult = data || [];
      // DEMO DATA INJECTION LOGIC
      if (!jobsResult || jobsResult.length === 0) {
        // If no real jobs exist, inject some demo jobs
        jobsResult = [
          {
            id: "job1",
            title: "Frontend Developer",
            description: "Exciting role working on next-gen UIs for India's leading fintech app.",
            company_id: null,
            company: {
              id: "cTCS",
              name: "Tata Consultancy Services",
              logo_url: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Tata_Consultancy_Services_Logo.svg",
              industry: "IT Services",
              website: "https://www.tcs.com/",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              description: "India's top IT company",
            },
            posted_by: "1a111111-1111-1111-1111-111111111111",
            poster: {
              full_name: "Rahul Sharma",
              avatar_url: "https://randomuser.me/api/portraits/men/70.jpg"
            } as any,
            location: "Mumbai",
            job_type: "full-time",
            salary_range: "₹12-18 LPA",
            experience_level: "2-4 years",
            skills: ["React", "UI Design", "JavaScript"],
            requirements: "Experience in React-based SPA, strong CSS knowledge.",
            benefits: "Health insurance, Gym, Flexible hours",
            application_deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
            status: "open",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            applications_count: [{ count: 4 }],
          },
          {
            id: "job2",
            title: "Data Scientist",
            description: "Work on cutting-edge AI projects for Infosys.",
            company_id: null,
            company: {
              id: "cInfy",
              name: "Infosys",
              logo_url: "https://upload.wikimedia.org/wikipedia/commons/8/81/Infosys_New_Logo.svg",
              industry: "Consulting",
              website: "https://www.infosys.com/",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              description: "Leading IT consulting company",
            },
            posted_by: "1a222222-2222-2222-2222-222222222222",
            poster: {
              full_name: "Priya Agarwal",
              avatar_url: "https://randomuser.me/api/portraits/women/65.jpg"
            } as any,
            location: "Bangalore",
            job_type: "full-time",
            salary_range: "₹18-24 LPA",
            experience_level: "3+ years",
            skills: ["Python", "Machine Learning", "Data Analysis"],
            requirements: "Proficiency in Python and ML frameworks.",
            benefits: "ESOPs, Remote work, Wellness allowance",
            application_deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
            status: "open",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            applications_count: [{ count: 8 }],
          },
          {
            id: "job3",
            title: "UX Designer (Internship)",
            description: "Paid internship opportunity at Wipro for creative students.",
            company_id: null,
            company: {
              id: "cWipro",
              name: "Wipro",
              logo_url: "https://upload.wikimedia.org/wikipedia/en/0/0c/Wipro_logo.svg",
              industry: "IT Services",
              website: "https://www.wipro.com/",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              description: "Innovation in Tech and Design",
            },
            posted_by: "1a444444-4444-4444-4444-444444444444",
            poster: {
              full_name: "Sneha Reddy",
              avatar_url: "https://randomuser.me/api/portraits/women/66.jpg"
            } as any,
            location: "Remote (India)",
            job_type: "internship",
            salary_range: "₹20,000/month",
            experience_level: "Student/fresher",
            skills: ["Figma", "Adobe XD", "Creativity"],
            requirements: "Portfolio of UX work, basic HTML/CSS.",
            benefits: "Paid internship, Laptop, Guidance from senior UX team",
            application_deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
            status: "open",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            applications_count: [{ count: 2 }],
          },
        ];
      }
      const transformedJobs = await transformJobs(jobsResult || []);
      setJobs(transformedJobs);
      setFeaturedJobs(transformedJobs.slice(0, 5));
      setLoading(false);
      return transformedJobs;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load job listings');
      setLoading(false);
      return [];
    }
  };

  const fetchJobById = async (id: string): Promise<Job | null> => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          company:companies(*),
          poster:profiles!jobs_posted_by_fkey(full_name, avatar_url),
          applications_count:job_applications(count)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (!data) return null;
      
      const [transformedJob] = await transformJobs([data]);
      return transformedJob;
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
      return null;
    }
  };

  const createJob = async (jobData: JobFormData): Promise<Job | null> => {
    if (!user) {
      toast.error('You must be logged in to post a job');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('jobs')
        .insert({
          title: jobData.title,
          description: jobData.description,
          company_id: jobData.company_id,
          posted_by: user.id,
          location: jobData.location,
          job_type: jobData.job_type,
          salary_range: jobData.salary_range,
          experience_level: jobData.experience_level,
          skills: jobData.skills,
          requirements: jobData.requirements,
          benefits: jobData.benefits,
          application_deadline: jobData.application_deadline?.toISOString(),
          status: jobData.status
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Job posted successfully');
      await fetchJobs(); // Refresh jobs list
      return data as unknown as Job;
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to post job');
      return null;
    }
  };

  const updateJob = async (id: string, jobData: JobFormData): Promise<Job | null> => {
    if (!user) {
      toast.error('You must be logged in to update a job');
      return null;
    }

    try {
      const { data: jobCheck } = await supabase
        .from('jobs')
        .select('posted_by')
        .eq('id', id)
        .single();
        
      if (!jobCheck || jobCheck.posted_by !== user.id) {
        // Remove role check, since role is not in UserProfile
        // const isAdmin = profile?.role === 'admin';
        // if (!isAdmin) {
          toast.error('You are not authorized to update this job listing');
          return null;
        // }
      }
      
      const { data, error } = await supabase
        .from('jobs')
        .update({
          title: jobData.title,
          description: jobData.description,
          company_id: jobData.company_id,
          location: jobData.location,
          job_type: jobData.job_type,
          salary_range: jobData.salary_range,
          experience_level: jobData.experience_level,
          skills: jobData.skills,
          requirements: jobData.requirements,
          benefits: jobData.benefits,
          application_deadline: jobData.application_deadline?.toISOString(),
          status: jobData.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Job updated successfully');
      await fetchJobs(); // Refresh jobs list
      return data as unknown as Job;
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
      return null;
    }
  };

  const deleteJob = async (id: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to delete a job');
      return false;
    }

    try {
      const { data: jobCheck } = await supabase
        .from('jobs')
        .select('posted_by')
        .eq('id', id)
        .single();
        
      if (!jobCheck || jobCheck.posted_by !== user.id) {
        // Remove role check
        // const isAdmin = profile?.role === 'admin';
        // if (!isAdmin) {
          toast.error('You are not authorized to delete this job listing');
          return false;
        // }
      }
      
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Job deleted successfully');
      await fetchJobs(); // Refresh jobs list
      return true;
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
      return false;
    }
  };

  const fetchUserBookmarks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('job_bookmarks')
        .select(`
          job_id,
          job:jobs(
            *,
            company:companies(*),
            poster:profiles!jobs_posted_by_fkey(full_name, avatar_url)
          )
        `)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      if (data) {
        const bookmarkedJobsData = data
          .map(bookmark => bookmark.job)
          .filter(job => job !== null);
          
        const transformedJobs = await transformJobs(bookmarkedJobsData);
        
        // All of these jobs are bookmarked
        transformedJobs.forEach(job => {
          job.is_bookmarked = true;
        });
        
        setBookmarkedJobs(transformedJobs);
      }
    } catch (error) {
      console.error('Error fetching bookmarked jobs:', error);
    }
  };

  const bookmarkJob = async (jobId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to bookmark jobs');
      return false;
    }

    try {
      // Check if already bookmarked
      const { data: existing, error: checkError } = await supabase
        .from('job_bookmarks')
        .select('id')
        .eq('job_id', jobId)
        .eq('user_id', user.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existing) {
        toast.info('Job is already bookmarked');
        return true;
      }
      
      // Insert bookmark
      const { error } = await supabase
        .from('job_bookmarks')
        .insert({
          job_id: jobId,
          user_id: user.id
        });
        
      if (error) throw error;
      
      toast.success('Job bookmarked successfully');
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, is_bookmarked: true } : job
        )
      );
      
      await fetchUserBookmarks(); // Refresh bookmarked jobs
      return true;
    } catch (error) {
      console.error('Error bookmarking job:', error);
      toast.error('Failed to bookmark job');
      return false;
    }
  };

  const removeBookmark = async (jobId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to remove bookmarks');
      return false;
    }

    try {
      const { error } = await supabase
        .from('job_bookmarks')
        .delete()
        .eq('job_id', jobId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success('Bookmark removed successfully');
      
      // Update local state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId ? { ...job, is_bookmarked: false } : job
        )
      );
      
      setBookmarkedJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
      return false;
    }
  };

  const isJobBookmarked = (jobId: string): boolean => {
    return bookmarkedJobs.some(job => job.id === jobId);
  };

  const fetchCompanies = async (): Promise<Company[]> => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
      return [];
    }
  };

  const createCompany = async (company: Partial<Company>): Promise<Company | null> => {
    if (!user) {
      toast.error('You must be logged in to create a company');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: company.name,
          description: company.description,
          logo_url: company.logo_url,
          website: company.website,
          industry: company.industry
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Company created successfully');
      return data;
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company');
      return null;
    }
  };

  const applyToJob = async (
    jobId: string, 
    application: { resume_url?: string, cover_letter?: string }
  ): Promise<JobApplication | null> => {
    if (!user) {
      toast.error('You must be logged in to apply for jobs');
      return null;
    }
    
    try {
      // Check if already applied
      const { data: existingApp, error: checkError } = await supabase
        .from('job_applications')
        .select('id, status')
        .eq('job_id', jobId)
        .eq('applicant_id', user.id)
        .maybeSingle();
        
      if (checkError) throw checkError;
      
      if (existingApp) {
        toast.info('You have already applied for this job');
        return null;
      }
      
      // Insert application
      const { data, error } = await supabase
        .from('job_applications')
        .insert({
          job_id: jobId,
          applicant_id: user.id,
          resume_url: application.resume_url,
          cover_letter: application.cover_letter
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Application submitted successfully');
      await fetchUserApplications(); // Refresh applications
      return data as unknown as JobApplication;
    } catch (error) {
      console.error('Error applying to job:', error);
      toast.error('Failed to submit application');
      return null;
    }
  };

  const fetchUserApplications = async (): Promise<JobApplication[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job:jobs(*)
        `)
        .eq('applicant_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const typedApplications = data?.map(app => ({
        ...app,
        status: app.status as ApplicationStatus,
        job: app.job ? {
          ...app.job,
          job_type: app.job.job_type as JobType,
        } : undefined
      })) as JobApplication[];
      
      setUserApplications(typedApplications);
      return typedApplications;
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
      return [];
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to update application status');
      return false;
    }
    
    try {
      // First verify the user can update this application
      const { data: appCheck, error: checkError } = await supabase
        .from('job_applications')
        .select('job_id')
        .eq('id', applicationId)
        .single();
        
      if (checkError) throw checkError;
      
      // Check if user is the job poster
      const { data: jobCheck, error: jobError } = await supabase
        .from('jobs')
        .select('posted_by')
        .eq('id', appCheck.job_id)
        .single();
        
      if (jobError) throw jobError;
      
      if (jobCheck.posted_by !== user.id) {
        // Remove role check
        // const isAdmin = profile?.role === 'admin';
        // if (!isAdmin) {
          toast.error('You are not authorized to update this application');
          return false;
        // }
      }
      
      // Update the application status
      const { error } = await supabase
        .from('job_applications')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', applicationId);
        
      if (error) throw error;
      
      toast.success('Application status updated');
      return true;
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
      return false;
    }
  };

  const fetchApplicationsForJob = async (jobId: string): Promise<JobApplication[]> => {
    if (!user) return [];
    
    try {
      // First verify the user can view these applications
      const { data: jobCheck, error: jobError } = await supabase
        .from('jobs')
        .select('posted_by')
        .eq('id', jobId)
        .single();
        
      if (jobError) throw jobError;
      
      if (jobCheck.posted_by !== user.id) {
        // Remove role check
        // const isAdmin = profile?.role === 'admin';
        // if (!isAdmin) {
          toast.error('You are not authorized to view these applications');
          return [];
        // }
      }
      
      // Fetch the applications
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          applicant:profiles!job_applications_applicant_id_fkey(full_name, avatar_url, email)
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform and add proper typing to the response data
      const typedApplications = data?.map(application => {
        // Handle potentially missing applicant data
        const applicantData = application.applicant || {};
        
        // Create properly typed applicant object with safe property access
        const applicant = {
          full_name: 'Unknown',
          avatar_url: undefined as string | undefined,
          email: undefined as string | undefined
        };
        
        // Only try to access properties if applicantData is a non-empty object
        if (typeof applicantData === 'object' && applicantData !== null) {
          // Use optional chaining and type checking for safer property access
          if ('full_name' in applicantData && typeof applicantData.full_name === 'string') {
            applicant.full_name = applicantData.full_name;
          }
          
          if ('avatar_url' in applicantData) {
            applicant.avatar_url = applicantData.avatar_url as string | undefined;
          }
          
          if ('email' in applicantData && typeof applicantData.email === 'string') {
            applicant.email = applicantData.email;
          }
        }
        
        return {
          ...application,
          status: application.status as ApplicationStatus,
          applicant
        } as JobApplication;
      }) as JobApplication[];
      
      return typedApplications || [];
    } catch (error) {
      console.error('Error fetching applications for job:', error);
      toast.error('Failed to load applications');
      return [];
    }
  };

  const createJobAlert = async (
    alert: Omit<JobAlert, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<JobAlert | null> => {
    if (!user) {
      toast.error('You must be logged in to create job alerts');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('job_alerts')
        .insert({
          user_id: user.id,
          job_type: alert.job_type,
          keywords: alert.keywords,
          locations: alert.locations,
          frequency: alert.frequency,
          is_active: alert.is_active
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Job alert created successfully');
      return {
        ...data,
        job_type: data.job_type as JobType[],
        frequency: data.frequency as AlertFrequency
      };
    } catch (error) {
      console.error('Error creating job alert:', error);
      toast.error('Failed to create job alert');
      return null;
    }
  };

  const fetchUserJobAlerts = async (): Promise<JobAlert[]> => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('job_alerts')
        .select('*')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      const typedAlerts = data?.map(alert => ({
        ...alert,
        job_type: alert.job_type as JobType[],
        frequency: alert.frequency as AlertFrequency
      })) as JobAlert[];
      
      return typedAlerts;
    } catch (error) {
      console.error('Error fetching job alerts:', error);
      toast.error('Failed to load job alerts');
      return [];
    }
  };

  const updateJobAlert = async (alertId: string, data: Partial<JobAlert>): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to update job alerts');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('job_alerts')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success('Job alert updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating job alert:', error);
      toast.error('Failed to update job alert');
      return false;
    }
  };

  const deleteJobAlert = async (alertId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to delete job alerts');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('job_alerts')
        .delete()
        .eq('id', alertId)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast.success('Job alert deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting job alert:', error);
      toast.error('Failed to delete job alert');
      return false;
    }
  };

  const value: JobsContextType = {
    jobs,
    featuredJobs,
    bookmarkedJobs,
    userApplications,
    loading,
    fetchJobs,
    fetchJobById,
    createJob,
    updateJob,
    deleteJob,
    bookmarkJob,
    removeBookmark,
    isJobBookmarked,
    fetchCompanies,
    createCompany,
    applyToJob,
    fetchUserApplications,
    updateApplicationStatus,
    fetchApplicationsForJob,
    createJobAlert,
    fetchUserJobAlerts,
    updateJobAlert,
    deleteJobAlert
  };

  return <JobsContext.Provider value={value}>{children}</JobsContext.Provider>;
}

export const useJobs = () => {
  const context = useContext(JobsContext);
  if (context === undefined) {
    throw new Error('useJobs must be used within a JobsProvider');
  }
  return context;
};
