
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Bookmark, Building2, MapPin, BookmarkCheck, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Job } from '@/types/jobs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface JobCardProps {
  job: Job;
  onToggleBookmark: () => void;
}

export default function JobCard({ job, onToggleBookmark }: JobCardProps) {
  const {
    id,
    title,
    company,
    location,
    job_type,
    created_at,
    is_bookmarked,
    application_deadline,
    poster,
    skills
  } = job;

  const postedDate = new Date(created_at);
  const timeAgo = formatDistanceToNow(postedDate, { addSuffix: true });
  
  const deadlineDate = application_deadline ? new Date(application_deadline) : null;
  const isDeadlineSoon = deadlineDate && (Number(deadlineDate) - Date.now()) / (1000 * 60 * 60 * 24) <= 3;

  const renderCompanyInfo = () => {
    if (company) {
      return (
        <div className="flex items-center gap-2">
          {company.logo_url ? (
            <Avatar className="h-6 w-6">
              <AvatarImage src={company.logo_url} alt={company.name} />
              <AvatarFallback>{company.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <Building2 className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-gray-700">{company.name}</span>
        </div>
      );
    } else {
      return <div className="text-gray-600">Company not specified</div>;
    }
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="pt-6">
        <div className="mb-4 flex justify-between items-start">
          <div>
            <Link to={`/jobs/${id}`} className="text-lg font-semibold hover:text-primary transition-colors">
              {title}
            </Link>
            <div className="mt-1">{renderCompanyInfo()}</div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleBookmark}
            title={is_bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
          >
            {is_bookmarked ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap text-sm text-gray-500 mt-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          
          <Badge variant={job_type === 'internship' ? 'default' : 'outline'}>
            {job_type.charAt(0).toUpperCase() + job_type.slice(1)}
          </Badge>
          
          {deadlineDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span className={isDeadlineSoon ? 'text-red-500 font-medium' : ''}>
                {isDeadlineSoon ? 'Closing soon' : `Closes ${formatDistanceToNow(deadlineDate, { addSuffix: true })}`}
              </span>
            </div>
          )}
        </div>
        
        {skills && skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="secondary" className="bg-gray-100">
                {skill}
              </Badge>
            ))}
            {skills.length > 5 && (
              <Badge variant="secondary" className="bg-gray-100">
                +{skills.length - 5} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-2 pb-4 border-t bg-gray-50">
        <div className="text-sm text-gray-500">
          Posted {timeAgo} {poster && `by ${poster.full_name}`}
        </div>
        <Link to={`/jobs/${id}`}>
          <Button variant="default" size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
