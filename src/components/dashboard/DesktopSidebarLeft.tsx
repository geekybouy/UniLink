
import React from "react";
import { Users, Briefcase, MessageSquare, Calendar, User, Network, BookOpen, Settings, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck } from "lucide-react";

const sideNav = [
  { label: "Feed", icon: Users, route: "/dashboard" },
  { label: "Community", icon: Network, route: "/community" },
  { label: "Messages", icon: MessageSquare, route: "/messages" },
  { label: "Network", icon: Network, route: "/network" },
  { label: "Credentials", icon: ShieldCheck, route: "/credentials" },
  { label: "Jobs", icon: Briefcase, route: "/jobs" },
  { label: "Events", icon: Calendar, route: "/events" },
  { label: "Knowledge", icon: BookOpen, route: "/knowledge" },
  { label: "Profile", icon: User, route: "/profile" },
  { label: "Settings", icon: Settings, route: "/settings" },
];

export default function DesktopSidebarLeft() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[250px] h-full sticky top-20">
      {/* User summary */}
      <div className="flex flex-col items-center py-6 rounded-xl bg-card border shadow-soft">
        <Avatar className="h-14 w-14 mb-2">
          {user?.user_metadata?.avatar_url ? (
            <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name ?? "Profile"} />
          ) : (
            <AvatarFallback>
              {user?.user_metadata?.full_name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          )}
        </Avatar>
        <span className="font-semibold">{user?.user_metadata?.full_name || user?.email}</span>
        <span className="text-xs text-muted-foreground">{user?.email}</span>
      </div>
      {/* Nav links */}
      <nav className="flex flex-col gap-2 mt-4">
        {sideNav.map(({ label, icon: Icon, route }) => (
          <button
            key={label}
            onClick={() => navigate(route)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary"
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
