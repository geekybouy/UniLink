
import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { Search, Bell, Calendar, MessageCircle } from "lucide-react";

// All icons are now functions that return JSX, whether emoji or Lucide icons
const navItems = [
  {
    label: "For You",
    path: "/dashboard/for-you",
    icon: (props: any) => <span className="font-bold text-lg" {...props}>🏠</span>,
  },
  {
    label: "Following",
    path: "/dashboard/following",
    icon: (props: any) => <span className="font-bold text-lg" {...props}>👥</span>,
  },
  { label: "Search", path: "/dashboard/search", icon: (props: any) => <Search {...props} /> },
  { label: "Notifications", path: "/dashboard/notifications", icon: (props: any) => <Bell {...props} /> },
  { label: "Events", path: "/dashboard/events", icon: (props: any) => <Calendar {...props} /> },
  { label: "Messages", path: "/dashboard/messages", icon: (props: any) => <MessageCircle {...props} /> },
];

export function AppSidebar() {
  const location = useLocation();
  return (
    <Sidebar className="hidden md:flex">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.path)}>
                    <Link to={item.path} className="flex items-center gap-3 text-base">
                      {item.icon({ className: "h-5 w-5" })}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
