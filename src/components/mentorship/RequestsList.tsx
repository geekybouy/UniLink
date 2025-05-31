
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MentorshipRequest } from '@/types/mentorship';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';

interface RequestsListProps {
  requests: MentorshipRequest[];
  isLoading?: boolean;
  onAcceptRequest?: (requestId: string) => void;
  onRejectRequest?: (requestId: string) => void;
  onCancelRequest?: (requestId: string) => void;
  type: 'sent' | 'received';
}

export function RequestsList({ 
  requests, 
  isLoading, 
  onAcceptRequest, 
  onRejectRequest, 
  onCancelRequest, 
  type 
}: RequestsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-muted-foreground">
            {type === 'sent' 
              ? 'You have not sent any mentorship requests yet.' 
              : 'You have not received any mentorship requests yet.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {type === 'sent' ? 'Request to Mentor' : 'Mentorship Request'}
                </CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(request.created_at), 'PPP')} 
                  <span className="mx-1">•</span>
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                </CardDescription>
              </div>
              <Badge 
                variant={
                  request.status === 'pending' ? 'outline' :
                  request.status === 'accepted' ? 'success' :
                  request.status === 'rejected' ? 'destructive' : 
                  'secondary'
                }
              >
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <h4 className="text-sm font-medium mb-1">Goals:</h4>
            <p className="text-sm text-muted-foreground mb-3">{request.goals}</p>
            
            <h4 className="text-sm font-medium mb-1">Interests:</h4>
            <div className="flex flex-wrap gap-1 mb-3">
              {request.interests.map((interest, index) => (
                <Badge key={index} variant="secondary">{interest}</Badge>
              ))}
            </div>
            
            {request.message && (
              <>
                <Separator className="my-3" />
                <h4 className="text-sm font-medium mb-1">Message:</h4>
                <p className="text-sm text-muted-foreground">{request.message}</p>
              </>
            )}
          </CardContent>
          
          {request.status === 'pending' && (
            <CardFooter className={type === 'received' ? 'gap-2' : undefined}>
              {type === 'received' && onAcceptRequest && onRejectRequest ? (
                <>
                  <Button 
                    onClick={() => onAcceptRequest(request.id)} 
                    className="flex-1"
                  >
                    Accept
                  </Button>
                  <Button 
                    onClick={() => onRejectRequest(request.id)} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Reject
                  </Button>
                </>
              ) : (
                type === 'sent' && onCancelRequest && (
                  <Button 
                    onClick={() => onCancelRequest(request.id)} 
                    variant="destructive"
                    size="sm"
                  >
                    Cancel Request
                  </Button>
                )
              )}
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
