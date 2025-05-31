
import React from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import BottomNavDock from "@/components/dashboard/BottomNavDock";
import DesktopSidebarLeft from "@/components/dashboard/DesktopSidebarLeft";
import DesktopSidebarRight from "@/components/dashboard/DesktopSidebarRight";
import FeedArea from "@/components/dashboard/FeedArea";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function Dashboard() {
  return (
    <div className="bg-background min-h-screen w-full">
      <DashboardHeader />

      {/* Desktop: sidebar-layout, center feed */}
      <div className="hidden lg:grid grid-cols-[260px_1fr_320px] gap-6 max-w-[1550px] mx-auto pt-24 px-8 pb-10">
        <DesktopSidebarLeft />
        <main className="flex flex-col gap-6 w-full">
          <WelcomeBanner />
          {/* New Social Feed Area */}
          <FeedArea />
        </main>
        <DesktopSidebarRight />
      </div>

      {/* Mobile/tablet: stacked layout, social feed only */}
      <div className="lg:hidden flex flex-col min-h-screen w-full">
        <div className="pt-20 px-2 flex flex-col gap-3 flex-grow max-w-2xl mx-auto w-full">
          <FeedArea />
        </div>
        <BottomNavDock />
      </div>
    </div>
  );
}
