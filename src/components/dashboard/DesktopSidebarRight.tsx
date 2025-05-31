
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function DesktopSidebarRight() {
  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[320px] pt-6">
      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">No new notifications.</div>
        </CardContent>
      </Card>
      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Trending Topics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">Coming soon.</div>
        </CardContent>
      </Card>
      {/* Suggestions and Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Suggested Connections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">No suggestions available.</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground">No upcoming events.</div>
        </CardContent>
      </Card>
      {/* Recent Activity */}
      <RecentActivity />
    </aside>
  );
}
