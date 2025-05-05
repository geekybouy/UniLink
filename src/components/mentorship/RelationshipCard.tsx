
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarPlus } from 'lucide-react';
import { getInitials, formatDate } from '@/lib/utils';

interface RelationshipCardProps {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  goals: string;
  isMentor: boolean;
  onScheduleSession: (relationshipId: string) => void;
  onOpenResources: (relationshipId: string) => void;
}

export function RelationshipCard({
  id,
  name,
  avatarUrl,
  role,
  startDate,
  endDate,
  isActive,
  goals,
  isMentor,
  onScheduleSession,
  onOpenResources
}: RelationshipCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription>{role}</CardDescription>
            </div>
          </div>
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="mb-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Relationship: </span>
            {isMentor ? 'You are mentoring' : 'You are being mentored by'} {name}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            <span className="font-medium text-foreground">Started: </span>
            {formatDate(startDate)}
            {endDate && (
              <>
                <span className="mx-1">•</span>
                <span className="font-medium text-foreground">Ended: </span>
                {formatDate(endDate)}
              </>
            )}
          </p>
        </div>
        {goals && (
          <div>
            <h4 className="text-sm font-medium mb-1">Goals:</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{goals}</p>
          </div>
        )}
      </CardContent>
      {isActive && (
        <CardFooter className="gap-2 flex-wrap">
          <Button 
            className="flex-1" 
            size="sm"
            onClick={() => onScheduleSession(id)}
          >
            <CalendarPlus className="h-4 w-4 mr-1" />
            Schedule Session
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onOpenResources(id)}
          >
            Resources
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
