
import React from 'react';
import { Job } from '@/types/jobs';
import JobCard from './JobCard';
import { useJobs } from '@/contexts/JobsContext';

interface JobListProps {
  jobs: Job[];
  emptyMessage?: string;
  loading?: boolean;
}

export default function JobList({ jobs, emptyMessage = "No jobs found", loading = false }: JobListProps) {
  const { bookmarkJob, removeBookmark } = useJobs();

  const handleToggleBookmark = async (job: Job) => {
    if (job.is_bookmarked) {
      await removeBookmark(job.id);
    } else {
      await bookmarkJob(job.id);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-md animate-pulse h-48 w-full"></div>
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-md text-center">
        <h3 className="text-lg font-medium text-gray-700">{emptyMessage}</h3>
        <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard 
          key={job.id} 
          job={job} 
          onToggleBookmark={() => handleToggleBookmark(job)}
        />
      ))}
    </div>
  );
}
