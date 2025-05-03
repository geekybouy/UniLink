
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Users, Clock, Video } from 'lucide-react';
import { Event } from '@/types/events';
import { format, isPast } from 'date-fns';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: Event;
  onRegister?: () => void;
  onCancel?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onRegister, onCancel }) => {
  const eventDate = new Date(event.date);
  const isPastEvent = isPast(eventDate);
  const eventTimestamp = format(eventDate, 'PPp');
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        {event.event_image_url && (
          <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg">
            <img 
              src={event.event_image_url} 
              alt={event.name} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </div>
        )}
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-xl line-clamp-2">{event.name}</CardTitle>
          {event.category && (
            <Badge variant={isPastEvent ? 'outline' : 'default'} className="capitalize whitespace-nowrap">
              {event.category.replace('_', ' ')}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{eventTimestamp}</span>
          </div>
          <div className="flex items-center gap-2">
            {event.is_virtual ? (
              <Video className="h-4 w-4 text-muted-foreground" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            )}
            <span>{event.is_virtual ? 'Virtual Event' : event.location}</span>
          </div>
          {(event.attendees_count !== undefined || event.max_attendees) && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>
                {event.attendees_count || 0}
                {event.max_attendees ? ` / ${event.max_attendees}` : ''} attendees
              </span>
            </div>
          )}
          <p className="line-clamp-2 mt-2 text-muted-foreground">
            {event.description}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2 pt-2 border-t">
        <Button asChild variant="outline" className="flex-1">
          <Link to={`/events/${event.id}`}>Details</Link>
        </Button>
        {!isPastEvent && (
          event.is_user_registered ? (
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
          ) : (
            <Button onClick={onRegister} className="flex-1">
              Register
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  );
};
