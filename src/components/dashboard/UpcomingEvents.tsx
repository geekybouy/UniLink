
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEvents } from '@/contexts/EventsContext';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';

export const UpcomingEvents = () => {
  const { upcomingEvents, loading } = useEvents();
  const events = upcomingEvents.slice(0, 3); // Display only the first 3 upcoming events

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Connect with alumni at these events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-6">
              <Spinner size="md" />
              <span className="ml-2 text-muted-foreground">Loading events...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
          <CardDescription>Connect with alumni at these events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No upcoming events</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link to="/events">View All Events</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
        <CardDescription>Connect with alumni at these events</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="font-medium hover:underline">
              <Link to={`/events/${event.id}`}>{event.name}</Link>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{format(new Date(event.date), 'MMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{format(new Date(event.date), 'h:mm a')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {event.is_virtual ? (
                <>
                  <Video className="h-3.5 w-3.5" />
                  <span>Virtual Event</span>
                </>
              ) : (
                <>
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{event.location}</span>
                </>
              )}
            </div>
            {event.attendees_count !== undefined && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>{event.attendees_count} attending</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link to="/events">View All Events</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
