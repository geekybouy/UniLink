
import React from 'react';
import { format } from 'date-fns';
import { Bookmark, BookmarkCheck, MapPin, Calendar, Building2, BarChart4, Briefcase, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/types/jobs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface JobDetailsProps {
  job: Job;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  onApply: () => void;
  hasApplied: boolean;
}

export default function JobDetails({ 
  job, 
  isBookmarked, 
  onToggleBookmark, 
  onApply,
  hasApplied 
}: JobDetailsProps) {
  const deadline = job.application_deadline ? new Date(job.application_deadline) : null;
  const isDeadlinePassed = deadline && deadline < new Date();

  const formatPostedDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          
          {job.company && (
            <div className="flex items-center mt-2 space-x-2">
              {job.company.logo_url ? (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={job.company.logo_url} alt={job.company.name} />
                  <AvatarFallback>{job.company.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <Building2 className="h-5 w-5 text-gray-500" />
              )}
              <span className="text-lg">{job.company.name}</span>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant={job.job_type === 'internship' ? 'default' : 'outline'}>
              {job.job_type.charAt(0).toUpperCase() + job.job_type.slice(1)}
            </Badge>
            
            {job.status !== 'open' && (
              <Badge variant={job.status === 'filled' ? 'destructive' : 'secondary'}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </Badge>
            )}
          </div>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleBookmark}
          className="flex items-center gap-1"
        >
          {isBookmarked ? (
            <>
              <BookmarkCheck className="h-4 w-4 text-primary" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              <span>Save</span>
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <span>{job.location}</span>
            </div>
            
            {job.salary_range && (
              <div className="flex items-center gap-2">
                <BarChart4 className="h-5 w-5 text-gray-500" />
                <span>{job.salary_range}</span>
              </div>
            )}
            
            {job.experience_level && (
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-gray-500" />
                <span>{job.experience_level}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <span>Posted on {formatPostedDate(job.created_at)}</span>
            </div>
            
            {deadline && (
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <span className={isDeadlinePassed ? "text-red-500" : ""}>
                  {isDeadlinePassed 
                    ? `Closed on ${format(deadline, 'PPP')}` 
                    : `Apply by ${format(deadline, 'PPP')}`}
                </span>
              </div>
            )}
          </div>
          
          <div className="pt-4 flex justify-center">
            <Button 
              className="w-full sm:w-auto" 
              disabled={job.status !== 'open' || isDeadlinePassed || hasApplied}
              onClick={onApply}
            >
              {hasApplied
                ? "Application Submitted"
                : job.status !== 'open'
                  ? `${job.status.charAt(0).toUpperCase() + job.status.slice(1)}`
                  : isDeadlinePassed
                    ? "Deadline Passed"
                    : "Apply Now"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Job Description</h2>
          <div className="prose max-w-none">
            <p className="whitespace-pre-line">{job.description}</p>
          </div>
        </div>
        
        {job.requirements && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Requirements</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{job.requirements}</p>
            </div>
          </div>
        )}
        
        {job.skills && job.skills.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {job.benefits && (
          <div>
            <h2 className="text-xl font-semibold mb-3">Benefits</h2>
            <div className="prose max-w-none">
              <p className="whitespace-pre-line">{job.benefits}</p>
            </div>
          </div>
        )}
        
        <div className="border-t pt-6">
          <p className="text-sm text-gray-500">
            Posted by {job.poster?.full_name || 'University Career Services'} on {formatPostedDate(job.created_at)}
          </p>
        </div>
      </div>
    </div>
  );
}
