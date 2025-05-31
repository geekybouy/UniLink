
import React from 'react';
import { MentorshipResource } from '@/types/mentorship';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { ExternalLink, FileText, BookOpen, Video, Layers, FileCode } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface ResourceListProps {
  resources: MentorshipResource[];
  isLoading?: boolean;
}

export function ResourceList({ resources, isLoading }: ResourceListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No resources have been shared yet.</p>
      </div>
    );
  }

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'article':
        return <FileText className="h-5 w-5" />;
      case 'book':
        return <BookOpen className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'course':
        return <Layers className="h-5 w-5" />;
      case 'document':
        return <FileCode className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {resources.map((resource) => (
        <Card key={resource.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{resource.title}</CardTitle>
              <Badge variant="outline">{resource.resource_type}</Badge>
            </div>
            <CardDescription>
              Shared on {formatDate(resource.created_at)}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            {resource.description && (
              <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
            )}
            <div className="flex items-center text-sm">
              {getResourceIcon(resource.resource_type)}
              <span className="ml-2 text-primary">
                {new URL(resource.resource_url).hostname}
              </span>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open(resource.resource_url, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Resource
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
