
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function RecentActivity() {
  // For demo purposes
  const ACTIVITY = [
    { id: 1, event: "You connected with Megha Bhatia", date: "2h ago" },
    { id: 2, event: "Job applied: Product Manager", date: "Yesterday" },
    { id: 3, event: "Event RSVP: 2025 Alumni Meetup", date: "2 days ago" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-xs flex flex-col gap-3">
          {ACTIVITY.map(item => (
            <li key={item.id} className="flex justify-between">
              <span>{item.event}</span>
              <span className="text-muted-foreground">{item.date}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
