
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MentorWithProfile } from '@/types/mentorship';
import { getInitials } from '@/lib/utils';

interface MentorCardProps {
  mentor: MentorWithProfile;
  onRequestMentorship: (mentorId: string, userId: string) => void;
  matchScore?: number;
}

export function MentorCard({ mentor, onRequestMentorship, matchScore }: MentorCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={mentor.profile?.avatar_url} alt={mentor.profile?.full_name} />
            <AvatarFallback>{getInitials(mentor.profile?.full_name || 'Mentor')}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <CardTitle className="text-lg">{mentor.profile?.full_name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {mentor.profile?.job_title}
              {mentor.profile?.current_company && ` at ${mentor.profile.current_company}`}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-sm line-clamp-3">{mentor.bio}</p>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {mentor.expertise.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="secondary">{skill}</Badge>
          ))}
          {mentor.expertise.length > 3 && (
            <Badge variant="outline">+{mentor.expertise.length - 3}</Badge>
          )}
        </div>
        {matchScore !== undefined && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">Match score: 
              <span className="font-medium ml-1 text-primary">
                {matchScore > 3 ? 'Excellent' : matchScore > 1 ? 'Good' : 'Basic'} match
              </span>
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => onRequestMentorship(mentor.id, mentor.user_id)}
          variant="default"
        >
          Request Mentorship
        </Button>
      </CardFooter>
    </Card>
  );
}
