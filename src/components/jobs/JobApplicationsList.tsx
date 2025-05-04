
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { JobApplication, ApplicationStatus } from '@/types/jobs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface JobApplicationsListProps {
  applications: JobApplication[];
  onUpdateStatus: (applicationId: string, status: ApplicationStatus) => void;
}

const statusColors: Record<ApplicationStatus, string> = {
  'pending': 'bg-yellow-100 text-yellow-800',
  'reviewed': 'bg-blue-100 text-blue-800',
  'interviewing': 'bg-purple-100 text-purple-800',
  'rejected': 'bg-red-100 text-red-800',
  'accepted': 'bg-green-100 text-green-800',
};

export default function JobApplicationsList({ applications, onUpdateStatus }: JobApplicationsListProps) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No applications have been received yet.</p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Applications ({applications.length})</h2>
      </div>
      
      {applications.map((application) => {
        const appliedDate = new Date(application.created_at);
        const timeAgo = formatDistanceToNow(appliedDate, { addSuffix: true });
        
        return (
          <Card key={application.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage 
                      src={application.applicant?.avatar_url || ''} 
                      alt={application.applicant?.full_name || 'Applicant'} 
                    />
                    <AvatarFallback>
                      {getInitials(application.applicant?.full_name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <h3 className="font-semibold">{application.applicant?.full_name}</h3>
                    <p className="text-sm text-gray-500">{application.applicant?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Badge className={statusColors[application.status]}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-500">Applied {timeAgo}</span>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Cover Letter</h4>
                  <div className="bg-gray-50 rounded-md p-3 h-[100px] overflow-y-auto">
                    <p className="text-sm whitespace-pre-line">{application.cover_letter || 'No cover letter provided.'}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {application.resume_url && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      <div className="flex-1 text-sm">Resume</div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" asChild>
                          <a href={application.resume_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <a href={application.resume_url} download>
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-3">
                    <label className="text-sm font-medium mb-2 block">Update Status</label>
                    <Select 
                      defaultValue={application.status}
                      onValueChange={(value) => onUpdateStatus(application.id, value as ApplicationStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reviewed">Reviewed</SelectItem>
                        <SelectItem value="interviewing">Interviewing</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="accepted">Accepted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
