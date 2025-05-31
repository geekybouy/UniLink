import React from "react";
import { Home, Users, MessageSquare, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navItems = [
  {
    label: "Home",
    icon: Home,
    route: "/modern-dashboard"
  },
  {
    label: "Community",
    icon: Users,
    route: "/community" // <- new mobile community page, not alumni-directory
  },
  {
    label: "Messages",
    icon: MessageSquare,
    route: "/messages"
  },
  {
    label: "Menu",
    icon: Menu,
    route: "/more"
  },
];

const MOBILE_BREAKPOINT = 768;

const BottomDockNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Always render on mobile, never route to /dashboard:
  if (typeof window !== "undefined" && window.innerWidth >= MOBILE_BREAKPOINT)
    return null;

  const handleNav = (route: string) => {
    // never route to /dashboard from a mobile device
    if (route === "/dashboard") {
      navigate("/modern-dashboard");
    } else {
      navigate(route);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 w-full z-[51] bg-white/80 backdrop-blur shadow-[0_-2px_18px_rgba(0,0,0,0.09)] border-t border-border h-16 flex md:hidden">
      <ul className="flex w-full justify-around items-center h-full px-1">
        {navItems.map(({ label, icon: Icon, route }) => {
          const isActive = (route === "/modern-dashboard" && location.pathname === "/modern-dashboard") ||
                           (route !== "/modern-dashboard" && location.pathname.startsWith(route));
          return (
            <li key={label}>
              <button
                className={`flex flex-col items-center justify-center px-2 py-1 transition ${isActive ? "text-primary font-semibold" : "text-muted-foreground"} group`}
                onClick={() => handleNav(route)}
                aria-label={label}
              >
                <Icon className={`w-6 h-6 ${isActive ? "" : "group-hover:text-primary"}`} />
                <span className="text-xs mt-1">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
export default BottomDockNav;

// Only mobile pages should use /modern-dashboard
