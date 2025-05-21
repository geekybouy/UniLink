
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { Clock, Building2, MapPin, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MainLayout from '@/layouts/MainLayout';
import { useJobs } from '@/contexts/JobsContext';
import { JobApplication, ApplicationStatus } from '@/types/jobs';
import ErrorBoundary from "@/components/ErrorBoundary";

// Add missing statusColors map
const statusColors: Record<ApplicationStatus, { bg: string; text: string }> = {
  pending: { bg: 'bg-gray-200', text: 'text-gray-700' },
  reviewed: { bg: 'bg-blue-50', text: 'text-blue-800' },
  interviewing: { bg: 'bg-yellow-100', text: 'text-yellow-900' },
  accepted: { bg: 'bg-green-100', text: 'text-green-800' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700' },
};

export default function MyApplicationsPage() {
  const { userApplications, fetchUserApplications } = useJobs();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  useEffect(() => {
    const loadApplications = async () => {
      setLoading(true);
      await fetchUserApplications();
      setLoading(false);
    };
    
    loadApplications();
  }, []);
  
  const filterApplications = (status?: ApplicationStatus | 'active'): JobApplication[] => {
    if (status === 'active') {
      return userApplications.filter(
        app => app.status === 'pending' || app.status === 'reviewed' || app.status === 'interviewing'
      );
    } else if (status) {
      return userApplications.filter(app => app.status === status);
    }
    return userApplications;
  };
  
  const applications = filterApplications(activeTab as any);
  
  if (loading) {
    return (
      <ErrorBoundary>
        <MainLayout>
          <div className="container mx-auto max-w-4xl px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </MainLayout>
      </ErrorBoundary>
    );
  }
  
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <h3 className="text-lg font-medium">No applications found</h3>
      <p className="text-gray-500 mt-2">
        You haven't submitted any job applications yet.
      </p>
      <Button asChild className="mt-4">
        <Link to="/jobs">Browse Jobs</Link>
      </Button>
    </div>
  );
  
  return (
    <ErrorBoundary>
      <MainLayout>
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">My Applications</h1>
              <p className="text-gray-500 mt-2">
                Track and manage your job applications
              </p>
            </div>
            <Button asChild>
              <Link to="/jobs">Browse More Jobs</Link>
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">
                All ({userApplications.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({filterApplications('active').length})
              </TabsTrigger>
              <TabsTrigger value="interviewing">
                Interviewing ({filterApplications('interviewing').length})
              </TabsTrigger>
              <TabsTrigger value="accepted">
                Accepted ({filterApplications('accepted').length})
              </TabsTrigger>
              <TabsTrigger value="rejected">
                Rejected ({filterApplications('rejected').length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {applications.length === 0 ? (
            renderEmptyState()
          ) : (
            <div className="space-y-4">
              {applications.map(application => {
                const job = application.job;
                if (!job) return null;
                
                const appliedDate = new Date(application.created_at);
                const timeAgo = formatDistanceToNow(appliedDate, { addSuffix: true });
                const formattedDate = format(appliedDate, 'MMM d, yyyy');
                
                return (
                  <Card key={application.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <Link to={`/jobs/${job.id}`} className="group">
                          <CardTitle className="group-hover:text-primary transition-colors">
                            {job.title}
                          </CardTitle>
                        </Link>
                        <Badge className={`${statusColors[application.status].bg} ${statusColors[application.status].text}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center text-gray-600">
                          <Building2 className="h-4 w-4 mr-2" />
                          <span>{job.company?.name || 'Company not specified'}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Applied {timeAgo}</span>
                        </div>
                      </div>
                      
                      {application.resume_url && (
                        <div className="flex items-center mt-2 gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <a 
                            href={application.resume_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm underline text-primary"
                          >
                            View Resume
                          </a>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <div className="text-sm text-gray-500">
                          Applied on {formattedDate}
                        </div>
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/jobs/${job.id}`}>View Job</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </MainLayout>
    </ErrorBoundary>
  );
}
