import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/MainLayout';
import JobForm from '@/components/jobs/JobForm';
import { useJobs } from '@/contexts/JobsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { JobFormData } from '@/types/jobs';

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchJobById, updateJob } = useJobs();
  const { user } = useAuth();
  const { profile } = useProfile();
  
  const [jobData, setJobData] = useState<JobFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      
      try {
        const job = await fetchJobById(id);
        
        if (!job) {
          navigate('/jobs');
          return;
        }
        
        // Check if user is authorized to edit this job
        // Replace profile?.role with correct user role fetch if needed; 
        // for now just check if isAdmin variable
        const isAdmin = false; // Set appropriately if admin state is elsewhere
        if (job.posted_by !== user?.id && !isAdmin) {
          navigate('/jobs');
          return;
        }
        
        // Convert to form data format
        const formData: JobFormData = {
          title: job.title,
          description: job.description,
          company_id: job.company_id,
          location: job.location,
          job_type: job.job_type,
          salary_range: job.salary_range,
          experience_level: job.experience_level,
          skills: job.skills || [],
          requirements: job.requirements,
          benefits: job.benefits,
          application_deadline: job.application_deadline ? new Date(job.application_deadline) : undefined,
          status: job.status
        };
        
        setJobData(formData);
      } catch (error) {
        console.error('Error loading job:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadJob();
  }, [id, user?.id]);
  
  const handleSubmit = async (data: JobFormData) => {
    if (!id || !user) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await updateJob(id, data);
      
      if (result) {
        navigate(`/jobs/${result.id}`);
      }
    } catch (error) {
      console.error('Error updating job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!jobData) {
    return (
      <MainLayout>
        <div className="container mx-auto max-w-4xl px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job listing you are trying to edit does not exist.</p>
          <Button asChild>
            <Link to="/jobs">Return to Job Board</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to={`/jobs/${id}`} className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to job details
          </Link>
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Job</h1>
          <p className="text-gray-500 mt-2">
            Update job details and requirements
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <JobForm 
            initialData={jobData}
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    </MainLayout>
  );
}
