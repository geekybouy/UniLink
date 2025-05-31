import React from "react";
import { Bell, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import SearchOverlay from "./SearchOverlay";
import { useState } from "react";

export default function DashboardHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-background/80 backdrop-blur border-b border-border flex items-center justify-between px-4 h-16 lg:h-20 transition-colors">
      <div className="flex items-center gap-2">
        {/* UniLink Logo */}
        <span className="font-playfair text-2xl font-bold text-primary tracking-wide cursor-pointer select-none" onClick={() => navigate("/dashboard")}>UniLink</span>
      </div>
      <div className="flex items-center gap-3">
        {/* Search */}
        <button
          className="rounded-full p-2 hover:bg-accent transition"
          aria-label="Search"
          onClick={() => setShowSearch(true)}
        >
          <Search className="h-6 w-6 text-muted-foreground" />
        </button>
        {/* Notifications */}
        <button
          className="rounded-full p-2 hover:bg-accent transition"
          aria-label="Notifications"
          onClick={() => navigate("/notifications")}
        >
          <Bell className="h-6 w-6 text-muted-foreground" />
        </button>
        {/* User Avatar & Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-full border border-transparent hover:border-accent outline-none focus:ring-1 focus:ring-primary transition">
              <Avatar className="h-10 w-10">
                {user?.user_metadata?.avatar_url ? (
                  <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.full_name ?? "Profile"} />
                ) : (
                  <AvatarFallback>
                    {user?.user_metadata?.full_name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 mt-2 z-50">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="font-semibold">{user?.user_metadata?.full_name || user?.email || "Profile"}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                localStorage.clear();
                window.location.href = "/auth/login";
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Search Overlay */}
      <SearchOverlay open={showSearch} onClose={() => setShowSearch(false)} />
    </header>
  );
}
