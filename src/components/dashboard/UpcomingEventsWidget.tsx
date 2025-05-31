
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

// More demo events
const demoEvents = [
  { name: "Annual Alumni Meet", date: "2025-06-14", location: "Delhi" },
  { name: "Virtual Networking Night", date: "2025-07-08", location: "Online" },
  { name: "Product Design Workshop", date: "2025-08-20", location: "Bangalore" },
  { name: "Tech Jobs Fair", date: "2025-09-10", location: "San Francisco" },
  { name: "Startup Pitch Day", date: "2025-09-25", location: "London" },
];

const UpcomingEventsWidget = () => (
  <Card className="shadow-soft rounded-xl">
    <CardHeader className="flex flex-row items-center gap-2 pb-3">
      <Calendar className="w-5 h-5 text-primary" />
      <CardTitle className="text-lg font-semibold tracking-tight">Upcoming Events</CardTitle>
    </CardHeader>
    <CardContent>
      {demoEvents.length === 0 ? (
        <div className="text-muted-foreground text-sm py-6 text-center">
          No upcoming events. Check back soon!
        </div>
      ) : (
        <ul className="space-y-3">
          {demoEvents.slice(0, 4).map((event, idx) => (
            <li key={idx} className="flex justify-between text-sm bg-accent/30 p-2 rounded">
              <span className="font-medium">{event.name}</span>
              <span className="text-xs text-muted-foreground">{event.date} · {event.location}</span>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);

export default UpcomingEventsWidget;

