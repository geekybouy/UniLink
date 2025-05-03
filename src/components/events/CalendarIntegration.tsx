
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Event } from '@/types/events';
import { Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarIntegrationProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  event,
  open,
  onOpenChange,
}) => {
  // Format dates for calendar integrations
  const formatDateForCalendar = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const startDate = new Date(event.date);
  const endDate = event.end_date 
    ? new Date(event.end_date) 
    : new Date(startDate.getTime() + (2 * 60 * 60 * 1000)); // Default 2 hours if no end date

  // Create Google Calendar link
  const googleCalendarLink = (() => {
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.name,
      details: `${event.description}\n\n${event.is_virtual && event.virtual_link ? `Virtual Link: ${event.virtual_link}` : ''}`,
      location: event.is_virtual ? 'Virtual Event' : event.location,
      dates: `${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}`
    });
    
    return `${baseUrl}?${params.toString()}`;
  })();

  // Create Outlook Calendar link
  const outlookCalendarLink = (() => {
    const baseUrl = 'https://outlook.live.com/calendar/0/deeplink/compose';
    const params = new URLSearchParams({
      subject: event.name,
      body: `${event.description}\n\n${event.is_virtual && event.virtual_link ? `Virtual Link: ${event.virtual_link}` : ''}`,
      location: event.is_virtual ? 'Virtual Event' : event.location,
      startdt: startDate.toISOString(),
      enddt: endDate.toISOString(),
      path: '/calendar/action/compose',
      rru: 'addevent'
    });
    
    return `${baseUrl}?${params.toString()}`;
  })();

  // Create iCal file download
  const createICalFile = () => {
    // Format dates for iCal format: 20210101T120000Z
    const formatDateForICal = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '').split('T').join('T');
    };
    
    const startDateString = formatDateForICal(startDate);
    const endDateString = formatDateForICal(endDate);
    
    // Create iCal content
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Alumni Portal//Events//EN',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `DTSTART:${startDateString}`,
      `DTEND:${endDateString}`,
      `SUMMARY:${event.name}`,
      `DESCRIPTION:${event.description}${event.is_virtual && event.virtual_link ? `\\nVirtual Link: ${event.virtual_link}` : ''}`,
      `LOCATION:${event.is_virtual ? 'Virtual Event' : event.location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\n');
    
    // Create a Blob with the iCal content
    const blob = new Blob([icalContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.name.replace(/\s+/g, '-').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Calendar file downloaded');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Calendar</DialogTitle>
          <DialogDescription>
            Choose your preferred calendar app to add this event.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4">
          <Button
            variant="outline"
            className="flex flex-col items-center h-auto py-4"
            onClick={() => window.open(googleCalendarLink, '_blank')}
          >
            <Calendar className="h-6 w-6 mb-1 text-red-500" />
            <span className="text-xs">Google Calendar</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center h-auto py-4"
            onClick={() => window.open(outlookCalendarLink, '_blank')}
          >
            <Calendar className="h-6 w-6 mb-1 text-blue-500" />
            <span className="text-xs">Outlook</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center h-auto py-4"
            onClick={createICalFile}
          >
            <Calendar className="h-6 w-6 mb-1 text-purple-500" />
            <span className="text-xs">iCal File</span>
          </Button>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
