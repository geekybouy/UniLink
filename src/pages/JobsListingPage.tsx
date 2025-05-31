import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, BellPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import MainLayout from '@/layouts/MainLayout';
import JobFiltersPanel from '@/components/jobs/JobFiltersPanel';
import JobList from '@/components/jobs/JobList';
import JobAlertForm from '@/components/jobs/JobAlertForm';
import { useJobs } from '@/contexts/JobsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { JobFilters, JobType } from '@/types/jobs';

export default function JobsListingPage() {
  const { jobs, loading, fetchJobs, bookmarkedJobs, createJobAlert } = useJobs();
  const { user } = useAuth();
  const { profile } = useProfile();
  
  const [filters, setFilters] = useState<JobFilters>({});
  const [activeTab, setActiveTab] = useState<string>('all');
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [isAlertFormOpen, setIsAlertFormOpen] = useState(false);
  
  useEffect(() => {
    fetchJobs(filters);
    
    // Extract unique locations from jobs
    const locations = jobs
      .map(job => job.location)
      .filter((location, index, self) => self.indexOf(location) === index);
    
    setAvailableLocations(locations);
  }, [filters]);
  
  const handleFilterChange = (newFilters: JobFilters) => {
    setFilters(newFilters);
  };
  
  const getFilteredJobs = () => {
    if (activeTab === 'bookmarked') {
      return bookmarkedJobs;
    }
    
    if (activeTab === 'internships') {
      return jobs.filter(job => job.job_type === 'internship');
    }
    
    if (activeTab === 'full-time') {
      return jobs.filter(job => job.job_type === 'full-time');
    }
    
    return jobs;
  };

  const canPostJobs = user && false; // Cannot check role here, set to false or update according to real user role check

  const handleCreateAlert = async (alertData: {
    job_type: JobType[];
    keywords: string[];
    locations: string[];
    frequency: 'daily' | 'weekly';
    is_active: boolean;
  }) => {
    await createJobAlert(alertData);
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Job Board</h1>
            <p className="text-gray-500 mt-2">
              Find job opportunities and internships
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {user && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAlertFormOpen(true)}
                className="flex items-center gap-1"
              >
                <BellPlus className="h-4 w-4" /> 
                Create Alert
              </Button>
            )}
            
            {canPostJobs && (
              <Button asChild>
                <Link to="/jobs/post" className="flex items-center gap-1">
                  <PlusCircle className="h-4 w-4" /> 
                  Post a Job
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="mb-6"
        >
          <TabsList className="grid grid-cols-4 md:w-[400px]">
            <TabsTrigger value="all">All Jobs</TabsTrigger>
            <TabsTrigger value="internships">Internships</TabsTrigger>
            <TabsTrigger value="full-time">Full-time</TabsTrigger>
            <TabsTrigger value="bookmarked">Saved</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Separator className="my-6" />
        
        <JobFiltersPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          availableLocations={availableLocations}
        />
        
        <JobList 
          jobs={getFilteredJobs()}
          loading={loading}
          emptyMessage={
            activeTab === 'bookmarked' 
              ? "You haven't saved any jobs yet" 
              : "No jobs match your search criteria"
          }
        />
        
        {isAlertFormOpen && (
          <JobAlertForm 
            isOpen={isAlertFormOpen} 
            onClose={() => setIsAlertFormOpen(false)} 
            onSubmit={handleCreateAlert}
          />
        )}
      </div>
    </MainLayout>
  );
}
