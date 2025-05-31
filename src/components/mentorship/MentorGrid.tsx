
import React from 'react';
import { MentorWithProfile, MentorMatch } from '@/types/mentorship';
import { MentorCard } from './MentorCard';

interface MentorGridProps {
  mentors: MentorWithProfile[] | MentorMatch[];
  onRequestMentorship: (mentorId: string, userId: string) => void;
  isLoading?: boolean;
  showMatchScore?: boolean;
}

export function MentorGrid({ mentors, onRequestMentorship, isLoading, showMatchScore }: MentorGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className="h-64 bg-card animate-pulse rounded-lg border"
          />
        ))}
      </div>
    );
  }

  if (mentors.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No mentors found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mentors.map((mentor) => (
        <MentorCard 
          key={mentor.id} 
          mentor={mentor as MentorWithProfile} 
          onRequestMentorship={onRequestMentorship}
          matchScore={showMatchScore && 'match_score' in mentor ? mentor.match_score : undefined}
        />
      ))}
    </div>
  );
}
