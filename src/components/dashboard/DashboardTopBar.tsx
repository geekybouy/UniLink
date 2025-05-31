
import React from "react";
import { Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export default function DashboardTopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-background/80 backdrop-blur border-b border-border flex items-center justify-between px-4 py-3 h-16 md:h-20 transition-colors">
      {/* User Avatar (left, mobile: right-aligned if needed) */}
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1 rounded-full border hover:border-accent outline-none focus:ring-1 focus:ring-primary transition">
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
          <DropdownMenuContent align="start" className="w-52 mt-2 z-50">
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
      {/* Search Bar */}
      <div className="flex items-center gap-2 w-full max-w-xs ml-auto">
        <div className="relative w-full">
          <input
            type="text"
            className="bg-accent/60 dark:bg-muted/20 border border-border rounded-lg px-4 pl-10 py-2 w-full ring-0 focus:ring-1 focus:ring-primary transition"
            placeholder="Search UniLink..."
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </header>
  );
}
