
import React from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useNavigate } from "react-router-dom";
import {
  User,
  Edit,
  FileText,
  Users,
  Briefcase,
  Book,
  Settings,
  LogOut,
  Code,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

const university = "Sample University"; // Replace with dynamic value if you have it
const graduationYear = "2023"; // Replace with dynamic value if you have it

export default function ProfileDropdown() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: User,
      label: "View Profile",
      onClick: () => navigate(profile?.is_profile_complete ? "/profile/view" : "/profile"),
    },
    {
      icon: Edit,
      label: "Edit Profile",
      onClick: () => navigate("/profile"),
    },
    {
      icon: FileText,
      label: "CV Maker",
      onClick: () => navigate("/cv-maker"),
    },
    {
      icon: Users,
      label: "Connection Requests",
      onClick: () => navigate("/network"),
    },
    {
      icon: Briefcase,
      label: "Jobs",
      onClick: () => navigate("/jobs"),
    },
    {
      icon: Users,
      label: "Community",
      onClick: () => navigate("/alumni-directory"),
    },
    {
      icon: Book,
      label: "Knowledge Base",
      onClick: () => navigate("/knowledge"),
    },
    {
      icon: Code,
      label: "Developer Portal",
      onClick: () => navigate("/developer"),
    },
    {
      icon: Database,
      label: "Integration Dashboard",
      onClick: () => navigate("/admin/integrations"),
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => navigate("/privacy-settings"),
    },
  ];

  return (
    <DropdownMenu modal>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "ring-offset-background focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full",
            "transition-transform duration-150 hover:scale-105"
          )}
          aria-label="Open profile menu"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={profile?.profile_image_url || ""} />
            <AvatarFallback>
              {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-72 py-3 px-0 bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-border"
      >
        {/* Top section: user info */}
        <div className="flex items-center gap-3 px-4 py-2">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile?.profile_image_url || ""} />
            <AvatarFallback className="text-lg">
              {profile?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="font-medium text-base truncate">{profile?.name || "User"}</div>
            <div className="text-xs text-muted-foreground truncate">
              {university} · Class of {graduationYear}
            </div>
            {profile?.username && (
              <div className="text-xs text-muted-foreground">@{profile.username}</div>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        {/* Main menu items */}
        <DropdownMenuGroup>
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.label}
              onClick={item.onClick}
              className="flex items-center gap-3 px-4 py-2 text-sm transition-colors focus:bg-accent/60 hover:bg-accent/60 outline-none"
            >
              <item.icon className="w-5 h-5 text-primary" />
              <span className="truncate">{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive px-4 py-2 text-sm flex items-center gap-3 cursor-pointer"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
