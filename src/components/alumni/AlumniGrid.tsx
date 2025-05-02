
import React from 'react';
import { UserProfile } from '@/types/profile';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, ExternalLink, UserPlus } from 'lucide-react';
import ConnectionButton from '../connection/ConnectionButton';

export interface AlumniGridProps {
  alumni: UserProfile[];
  onMessage?: (profileId: string) => void;
  onViewProfile: (profileId: string) => void;
  onConnect?: (profileId: string) => void;
}

const AlumniGrid: React.FC<AlumniGridProps> = ({ 
  alumni,
  onMessage,
  onViewProfile,
  onConnect
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {alumni.map((profile) => (
        <Card key={profile.id} className="p-6 flex flex-col">
          <div className="flex items-start space-x-4 mb-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatarUrl || undefined} alt={profile.fullName} />
              <AvatarFallback>{profile.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{profile.fullName}</h3>
              <p className="text-sm text-muted-foreground">
                {profile.job_title}{profile.job_title && profile.current_company ? ' at ' : ''}
                {profile.current_company}
              </p>
              {profile.graduationYear && (
                <p className="text-sm text-muted-foreground">
                  {profile.branch ? `${profile.branch}, ` : ''}{profile.graduationYear}
                </p>
              )}
            </div>
          </div>
          
          {profile.bio && (
            <p className="text-sm mb-4 line-clamp-2">{profile.bio}</p>
          )}
          
          {profile.skills && profile.skills.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1">
              {profile.skills.slice(0, 3).map((skill) => (
                <span 
                  key={skill.id} 
                  className="bg-muted text-xs px-2 py-1 rounded-full"
                >
                  {skill.name}
                </span>
              ))}
              {profile.skills.length > 3 && (
                <span className="text-xs text-muted-foreground self-center">
                  +{profile.skills.length - 3} more
                </span>
              )}
            </div>
          )}
          
          <div className="flex gap-2 mt-auto">
            {profile.userId && (
              <ConnectionButton 
                userId={profile.userId} 
                className="flex-1"
              />
            )}
            
            {onMessage && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => onMessage(profile.id)}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onViewProfile(profile.id)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default AlumniGrid;
