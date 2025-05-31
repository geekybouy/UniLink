
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MainLayout from '@/layouts/MainLayout';
import JobForm from '@/components/jobs/JobForm';
import { useJobs } from '@/contexts/JobsContext';
import { useAuth } from '@/contexts/AuthContext';
import { JobFormData } from '@/types/jobs';

export default function PostJobPage() {
  const navigate = useNavigate();
  const { createJob } = useJobs();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data: JobFormData) => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/auth/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await createJob(data);
      
      if (result) {
        navigate(`/jobs/${result.id}`);
      }
    } catch (error) {
      console.error('Error creating job:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/jobs" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to job board
          </Link>
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Post a New Job</h1>
          <p className="text-gray-500 mt-2">
            Create a new job or internship listing
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <JobForm 
            onSubmit={handleSubmit}
            isLoading={isSubmitting}
          />
        </div>
      </div>
    </MainLayout>
  );
}
