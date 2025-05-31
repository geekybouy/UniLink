
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface SessionCardProps {
  id: string;
  title: string;
  scheduledAt: string;
  duration: number;
  location: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'canceled';
  onComplete?: (id: string) => void;
  onCancel?: (id: string) => void;
  onLeaveFeedback?: (id: string) => void;
  showFeedback?: boolean;
}

export function SessionCard({
  id,
  title,
  scheduledAt,
  duration,
  location,
  notes,
  status,
  onComplete,
  onCancel,
  onLeaveFeedback,
  showFeedback = false,
}: SessionCardProps) {
  const sessionDate = new Date(scheduledAt);
  const isPast = sessionDate < new Date();
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Badge 
            variant={
              status === 'scheduled' ? 'outline' :
              status === 'completed' ? 'success' : 'destructive'
            }
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{format(sessionDate, 'EEEE, MMMM d, yyyy')}</span>
          <span className="mx-1">•</span>
          <Clock className="h-3 w-3" />
          <span>{format(sessionDate, 'h:mm a')} ({duration} min)</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pb-3">
        <div className="flex items-center text-sm">
          <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
          <span className="text-muted-foreground">{location}</span>
        </div>
        {notes && <p className="text-sm line-clamp-2">{notes}</p>}
      </CardContent>
      
      {status === 'scheduled' && (
        <CardFooter className="gap-2">
          {!isPast ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onCancel?.(id)}
            >
              Cancel
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onComplete?.(id)}
            >
              Mark Complete
            </Button>
          )}
        </CardFooter>
      )}
      
      {status === 'completed' && showFeedback && (
        <CardFooter>
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full"
            onClick={() => onLeaveFeedback?.(id)}
          >
            Leave Feedback
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
