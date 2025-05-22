
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
  { label: "Search", path: "/dashboard/search", icon: Search },
  { label: "Notifications", path: "/dashboard/notifications", icon: Bell },
  { label: "Events", path: "/dashboard/events", icon: Calendar },
  { label: "Messages", path: "/dashboard/messages", icon: MessageCircle },
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
                      {typeof item.icon === "function"
                        ? item.icon({ className: "h-5 w-5" })
                        : <item.icon className="h-5 w-5" />}
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
