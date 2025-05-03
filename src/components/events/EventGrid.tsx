
import React from 'react';
import { EventCard } from './EventCard';
import { Event } from '@/types/events';
import { useEvents } from '@/contexts/EventsContext';
import { Calendar } from 'lucide-react';

interface EventGridProps {
  events: Event[];
  emptyMessage?: string;
}

export const EventGrid: React.FC<EventGridProps> = ({ 
  events, 
  emptyMessage = "No events found" 
}) => {
  const { registerForEvent, cancelRegistration } = useEvents();

  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-6">
          <Calendar className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-xl font-semibold">{emptyMessage}</h3>
        <p className="mt-2 text-muted-foreground">
          Check back later for upcoming events.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <EventCard 
          key={event.id} 
          event={event}
          onRegister={() => registerForEvent(event.id)}
          onCancel={() => cancelRegistration(event.id)}
        />
      ))}
    </div>
  );
};
