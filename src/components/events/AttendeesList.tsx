
import React from 'react';
import { EventAttendee } from '@/types/events';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageButton } from '@/components/messaging/MessageButton';
import { getInitials } from '@/lib/utils';

interface AttendeesListProps {
  attendees: EventAttendee[];
}

export const AttendeesList: React.FC<AttendeesListProps> = ({ attendees }) => {
  if (!attendees.length) {
    return <p className="text-muted-foreground">No attendees yet.</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{attendees.length} Attendee{attendees.length !== 1 ? 's' : ''}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attendees.map((attendee) => (
          <div key={attendee.id} className="flex items-center justify-between border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={attendee.user?.avatar_url} />
                <AvatarFallback>{getInitials(attendee.user?.full_name || '')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{attendee.user?.full_name}</p>
                <p className="text-sm text-muted-foreground">{attendee.user?.email}</p>
              </div>
            </div>
            <MessageButton userId={attendee.user_id} variant="outline" />
          </div>
        ))}
      </div>
    </div>
  );
};
