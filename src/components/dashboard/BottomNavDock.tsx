
import React from "react";
import { Home, Users, MessageSquare, Menu, Network } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

// Navigation config for modern pages
const NAV = [
  {
    label: "Home",
    icon: Home,
    route: "/dashboard", // Dashboard
  },
  {
    label: "Community",
    icon: Users,
    route: "/community", // Updated modern Community page
  },
  {
    label: "Messages",
    icon: MessageSquare,
    route: "/messages", // Modern MessagingPage
  },
  {
    label: "Network",
    icon: Network,
    route: "/network", // Modern MyNetwork page
  },
  {
    label: "Menu",
    icon: Menu,
    route: "/more", // Modern Menu page
  },
];

export default function BottomNavDock() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 w-full z-[99] bg-background/90 backdrop-blur shadow-[0_-2px_18px_rgba(0,0,0,0.12)] border-t border-border h-16 flex md:hidden">
      <ul className="flex w-full justify-around items-center h-full px-1">
        {NAV.map(({ label, icon: Icon, route }) => {
          // Highlight active tab accurately
          const isActive =
            route === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(route);

          return (
            <li key={label}>
              <button
                className={`flex flex-col items-center justify-center px-2 py-1 transition ${
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                } group`}
                onClick={() => navigate(route)}
                aria-label={label}
              >
                <Icon className={`w-7 h-7 mb-1 ${isActive ? "" : "group-hover:text-primary"}`} />
                <span className="text-xs">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
