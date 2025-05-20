import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import MainLayout from '@/layouts/MainLayout';
import JobDetails from '@/components/jobs/JobDetails';
import JobApplicationsList from '@/components/jobs/JobApplicationsList';
import ApplicationForm from '@/components/jobs/ApplicationForm';
import { useJobs } from '@/contexts/JobsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Job, ApplicationStatus } from '@/types/jobs';

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { 
    fetchJobById, 
    bookmarkJob, 
    removeBookmark, 
    isJobBookmarked,
    applyToJob, 
    fetchApplicationsForJob,
    deleteJob,
    updateApplicationStatus
  } = useJobs();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  useEffect(() => {
    const loadJob = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const jobData = await fetchJobById(id);
        setJob(jobData);
        
        if (jobData) {
          setIsBookmarked(isJobBookmarked(jobData.id) || jobData.is_bookmarked || false);
          
          // Check if the current user is the job poster
          const isJobPoster = user && jobData.posted_by === user.id;
          const isAdmin = false; // Remove profile?.role usage here
  
          if (isJobPoster || isAdmin) {
            const appData = await fetchApplicationsForJob(jobData.id);
            setApplications(appData);
            
            // Switch to applications tab if there are applications
            if (appData.length > 0 && (isJobPoster || isAdmin)) {
              setActiveTab('applications');
            }
          }
          
          // Check if user has already applied
          if (user) {
            const appData = await fetchApplicationsForJob(jobData.id);
            setHasApplied(appData.some(app => app.applicant_id === user.id));
          }
        }
      } catch (error) {
        console.error('Error loading job:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadJob();
  }, [id, user?.id]);
  
  const handleToggleBookmark = async () => {
    if (!job) return;
    
    if (isBookmarked) {
      await removeBookmark(job.id);
      setIsBookmarked(false);
    } else {
      await bookmarkJob(job.id);
      setIsBookmarked(true);
    }
  };

  const handleApply = async (applicationData: { resume_url?: string; cover_letter?: string }) => {
    if (!job || !user) return;
    
    try {
      const result = await applyToJob(job.id, applicationData);
      if (result) {
        setHasApplied(true);
      }
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };
  
  const handleDeleteJob = async () => {
    if (!job) return;
    
    const success = await deleteJob(job.id);
    if (success) {
      navigate('/jobs');
    }
  };
  
  const handleUpdateApplicationStatus = async (applicationId: string, status: string) => {
    await updateApplicationStatus(applicationId, status);
    
    // Refresh applications list
    if (job) {
      const updatedApps = await fetchApplicationsForJob(job.id);
      setApplications(updatedApps);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <div className="container mx-auto max-w-4xl px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-6">The job listing you are looking for does not exist or has been removed.</p>
          <Button asChild>
            <Link to="/jobs">Return to Job Board</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

  const isJobPoster = user && job.posted_by === user.id;
  const isAdmin = false; // Remove profile?.role usage here
  const canManageJob = isJobPoster || isAdmin;
  
  return (
    <MainLayout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/jobs" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to job board
            </Link>
          </Button>
          
          {canManageJob && (
            <div className="flex justify-end gap-2 mb-4">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/jobs/${job.id}/edit`} className="flex items-center">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Job
                </Link>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex items-center">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Job
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this job listing 
                      and remove all associated applications.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteJob} className="bg-red-600">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
        
        {canManageJob && applications.length > 0 && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="w-[400px]">
              <TabsTrigger value="details">Job Details</TabsTrigger>
              <TabsTrigger value="applications">
                Applications ({applications.length})
              </TabsTrigger>
            </TabsList>
            <Separator className="my-4" />
          </Tabs>
        )}
        
        <TabsContent value="details" className={activeTab === 'details' ? 'block' : 'hidden'}>
          <JobDetails 
            job={job}
            isBookmarked={isBookmarked}
            onToggleBookmark={handleToggleBookmark}
            onApply={() => setIsApplyDialogOpen(true)}
            hasApplied={hasApplied}
          />
        </TabsContent>
        
        {canManageJob && (
          <TabsContent value="applications" className={activeTab === 'applications' ? 'block' : 'hidden'}>
            <JobApplicationsList 
              applications={applications}
              onUpdateStatus={(applicationId, status) => 
                handleUpdateApplicationStatus(applicationId, status as ApplicationStatus)
              }
            />
          </TabsContent>
        )}
        
        <ApplicationForm 
          isOpen={isApplyDialogOpen}
          onClose={() => setIsApplyDialogOpen(false)}
          jobId={job.id}
          jobTitle={job.title}
          onSubmit={handleApply}
        />
      </div>
    </MainLayout>
  );
}
