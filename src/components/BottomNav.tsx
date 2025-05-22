
import { useLocation, Link } from "react-router-dom";
import { Search, Bell, Calendar, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "For You",
    path: "/dashboard/for-you",
    icon: (props: any) => <span className="font-bold text-lg" {...props}>🏠</span>
  },
  {
    label: "Following",
    path: "/dashboard/following",
    icon: (props: any) => <span className="font-bold text-lg" {...props}>👥</span>
  },
  { label: "Search", path: "/dashboard/search", icon: Search },
  { label: "Notif", path: "/dashboard/notifications", icon: Bell },
  { label: "Events", path: "/dashboard/events", icon: Calendar },
  { label: "Msg", path: "/dashboard/messages", icon: MessageCircle },
];

const BottomNav = () => {
  const location = useLocation();
  return (
    <nav className="fixed md:hidden bottom-0 left-0 w-full bg-white border-t h-16 z-50 flex justify-around shadow">
      {navItems.map((item) => {
        const active = location.pathname.startsWith(item.path);
        return (
          <Link
            to={item.path}
            key={item.label}
            className={cn(
              "flex flex-col items-center justify-center flex-1 text-xs",
              active ? "text-primary font-bold" : "text-gray-500"
            )}
          >
            {typeof item.icon === "function"
              ? item.icon({ className: "h-6 w-6 mb-1" })
              : <item.icon className="h-6 w-6 mb-1" />}
            <span>{item.label}</span>
            {active && (
              <span className="w-6 h-1 bg-primary mt-1 rounded-t-lg"></span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
