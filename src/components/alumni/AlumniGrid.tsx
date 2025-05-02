
import { UserProfile } from '@/types/profile';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import ConnectionButton from '@/components/connection/ConnectionButton';

type AlumniGridProps = {
  alumni: UserProfile[];
  onMessage: (profileId: string) => void;
  onViewProfile: (profileId: string) => void;
};

const AlumniGrid = ({ alumni, onMessage, onViewProfile }: AlumniGridProps) => {
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {alumni.map((alumnus) => (
        <Card key={alumnus.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={alumnus.avatarUrl || ''} alt={alumnus.fullName} />
                  <AvatarFallback>{getInitials(alumnus.fullName)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg">{alumnus.fullName}</h3>
                  <p className="text-muted-foreground text-sm">
                    {alumnus.job_title || 'Student'} {alumnus.current_company && `at ${alumnus.current_company}`}
                  </p>
                  {alumnus.university && (
                    <p className="text-sm text-muted-foreground">
                      {alumnus.university}
                    </p>
                  )}
                  <div className="flex gap-2 mt-1">
                    {alumnus.graduationYear && (
                      <Badge variant="outline" className="text-xs">
                        Batch of {alumnus.graduationYear}
                      </Badge>
                    )}
                    {alumnus.branch && (
                      <Badge variant="outline" className="text-xs">
                        {alumnus.branch}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {alumnus.location && (
                  <p className="text-sm text-muted-foreground mb-2">
                    📍 {alumnus.location}
                  </p>
                )}
                {alumnus.skills && alumnus.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {alumnus.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))}
                    {alumnus.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{alumnus.skills.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <ConnectionButton 
                  userId={alumnus.userId}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onMessage(alumnus.userId)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>

            <Button 
              variant="ghost" 
              className="w-full border-t rounded-none h-12 mt-2" 
              onClick={() => onViewProfile(alumnus.userId)}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Profile
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AlumniGrid;
