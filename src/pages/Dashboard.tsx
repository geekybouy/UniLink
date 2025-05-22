
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import { SidebarProvider } from "@/components/ui/sidebar"; // Add this import
import { AppSidebar } from "@/components/app-sidebar";
import BottomNav from "@/components/BottomNav";

// Section pages (stubs)
import ForYou from "./dashboard/ForYou";
import Following from "./dashboard/Following";
import SearchPage from "./dashboard/Search";
import NotificationsPage from "./dashboard/Notifications";
import EventsPage from "./dashboard/Events";
import MessagesPage from "./dashboard/Messages";

const Dashboard: React.FC = () => {
  return (
    <MainLayout hideFooter>
      <SidebarProvider>
        <div className="flex w-full min-h-screen">
          {/* Sidebar for desktop/tablet */}
          <AppSidebar />
          {/* Main content */}
          <div className="flex-1 flex flex-col items-center max-w-full mx-auto pt-2 pb-20 md:pb-2 bg-background">
            <div className="w-full max-w-2xl px-2 sm:px-6">
              <Routes>
                <Route path="/" element={<Navigate to="for-you" replace />} />
                <Route path="for-you" element={<ForYou />} />
                <Route path="following" element={<Following />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="events" element={<EventsPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="*" element={<div className="text-center text-muted-foreground py-20">Section Not Found</div>} />
              </Routes>
            </div>
          </div>
          {/* Bottom navigation for mobile */}
          <BottomNav />
        </div>
      </SidebarProvider>
    </MainLayout>
  );
};

export default Dashboard;
