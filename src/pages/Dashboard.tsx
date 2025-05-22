
import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { Card } from "@/components/ui/card";
import AlumniFeedWidget from "@/components/dashboard/AlumniFeedWidget";
import ConnectionsOverviewWidget from "@/components/dashboard/ConnectionsOverviewWidget";
import QuickActionsWidget from "@/components/dashboard/QuickActionsWidget";
import UpcomingEventsWidget from "@/components/dashboard/UpcomingEventsWidget";
import JobHighlightsWidget from "@/components/dashboard/JobHighlightsWidget";
import MentorshipCornerWidget from "@/components/dashboard/MentorshipCornerWidget";

const Dashboard: React.FC = () => {
  // Debug: log render and screen info for mobile diagnostic
  if (typeof window !== "undefined") {
    console.log("Dashboard page loaded. window.innerWidth:", window.innerWidth, "User agent:", navigator.userAgent);
  }
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-2 md:px-6">
        {/* Page Heading */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
          <h1 className="text-3xl font-bold font-playfair text-primary mb-2 md:mb-0">
            Welcome to UniLink Alumni
          </h1>
          <QuickActionsWidget />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Feed & Connections */}
          <div className="md:col-span-7 flex flex-col gap-6">
            <AlumniFeedWidget />
            <ConnectionsOverviewWidget />
          </div>
          {/* Right: Events, Jobs, Mentorship */}
          <div className="md:col-span-5 flex flex-col gap-6">
            <UpcomingEventsWidget />
            <JobHighlightsWidget />
            <MentorshipCornerWidget />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
