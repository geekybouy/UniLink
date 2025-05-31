
import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Globe, 
  Video, 
  Clock, 
  CalendarCheck, 
  Share2,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Event } from '@/types/events';
import { format, formatDistanceToNow } from 'date-fns';
import { getInitials } from '@/lib/utils';

interface EventDetailsProps {
  event: Event;
  isRegistered: boolean;
  isPastEvent: boolean;
  onRegister: () => void;
  onCancel: () => void;
  onAddToCalendar: () => void;
  onShare: () => void;
}

export const EventDetails: React.FC<EventDetailsProps> = ({
  event,
  isRegistered,
  isPastEvent,
  onRegister,
  onCancel,
  onAddToCalendar,
  onShare
}) => {
  const eventDate = new Date(event.date);
  const eventEndDate = event.end_date ? new Date(event.end_date) : null;
  const formattedDate = format(eventDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(eventDate, 'h:mm a');
  const formattedEndTime = eventEndDate ? format(eventEndDate, 'h:mm a') : null;
  const timeUntilEvent = formatDistanceToNow(eventDate, { addSuffix: true });
  
  return (
    <div className="space-y-6">
      {event.event_image_url && (
        <div className="aspect-video w-full overflow-hidden rounded-lg">
          <img 
            src={event.event_image_url} 
            alt={event.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {event.category && (
            <Badge variant={isPastEvent ? 'outline' : 'default'} className="capitalize">
              {event.category.replace('_', ' ')}
            </Badge>
          )}
          {isPastEvent ? (
            <Badge variant="secondary">Past event</Badge>
          ) : (
            <Badge variant="success" className="bg-green-500">Upcoming</Badge>
          )}
          {event.is_virtual && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Video className="h-3 w-3" />
              Virtual
            </Badge>
          )}
        </div>
        
        <h1 className="text-3xl font-bold">{event.name}</h1>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Organized by</span>
          {event.creator ? (
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={event.creator.avatar_url || ''} />
                <AvatarFallback>{getInitials(event.creator.full_name)}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">{event.creator.full_name}</span>
            </div>
          ) : (
            <span>Unknown organizer</span>
          )}
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-[3fr_1fr]">
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">About this event</h2>
            <p className="whitespace-pre-line">{event.description}</p>
          </div>
          
          {isPastEvent && event.archive_url && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Event Recording</h2>
              <Button variant="outline" className="flex items-center gap-2" asChild>
                <a href={event.archive_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" /> Access Recording
                </a>
              </Button>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{formattedDate}</p>
                    <p className="text-sm text-muted-foreground">{timeUntilEvent}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{formattedTime}{formattedEndTime ? ` - ${formattedEndTime}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  {event.is_virtual ? (
                    <Video className="h-5 w-5 text-muted-foreground mt-0.5" />
                  ) : (
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">
                      {event.is_virtual ? 'Virtual Event' : event.location}
                    </p>
                    {event.is_virtual && event.virtual_link && isRegistered && !isPastEvent && (
                      <a 
                        href={event.virtual_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Join virtual event
                      </a>
                    )}
                  </div>
                </div>
                {(event.attendees_count !== undefined || event.max_attendees) && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {event.attendees_count || 0}
                        {event.max_attendees ? ` / ${event.max_attendees}` : ''} attendees
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {!isPastEvent && (
                <div className="space-y-3">
                  {isRegistered ? (
                    <>
                      <Button variant="outline" className="w-full" onClick={onCancel}>
                        Cancel Registration
                      </Button>
                      <Button className="w-full" onClick={onAddToCalendar}>
                        <CalendarCheck className="mr-2 h-4 w-4" /> Add to Calendar
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full" onClick={onRegister}>
                      Register for Event
                    </Button>
                  )}
                </div>
              )}
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full" onClick={onShare}>
                      <Share2 className="mr-2 h-4 w-4" /> Share Event
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share this event with others</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
