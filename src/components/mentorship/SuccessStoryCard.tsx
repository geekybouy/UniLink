
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDate, getInitials } from '@/lib/utils';
import { Quote } from 'lucide-react';
import { StarRating } from './StarRating';

interface SuccessStoryCardProps {
  id: string;
  title: string;
  mentorName: string;
  mentorAvatar?: string;
  menteeName: string;
  menteeAvatar?: string;
  createdAt: string;
  story: string;
  rating?: number;
  isFeatured?: boolean;
}

export function SuccessStoryCard({
  id,
  title,
  mentorName,
  mentorAvatar,
  menteeName,
  menteeAvatar,
  createdAt,
  story,
  rating = 5,
  isFeatured = false,
}: SuccessStoryCardProps) {
  return (
    <Card className={isFeatured ? 'border-primary' : undefined}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{title}</CardTitle>
          {isFeatured && <Badge>Featured Story</Badge>}
        </div>
        <CardDescription>
          Posted on {formatDate(createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={menteeAvatar} alt={menteeName} />
              <AvatarFallback>{getInitials(menteeName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{menteeName}</p>
              <p className="text-xs text-muted-foreground">Mentee</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-sm font-medium">{mentorName}</p>
              <p className="text-xs text-muted-foreground">Mentor</p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src={mentorAvatar} alt={mentorName} />
              <AvatarFallback>{getInitials(mentorName)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="pt-2 text-muted-foreground">
          <Quote className="h-6 w-6 mb-2 text-primary/30" />
          <p className="text-sm italic">{story}</p>
        </div>
        
        {rating > 0 && (
          <div className="pt-2">
            <StarRating rating={rating} readonly size="sm" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
