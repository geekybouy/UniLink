
import { useLocation, Link } from 'react-router-dom';
import { Home, Users, BookOpen, MessageCircle, Bell, Calendar, Briefcase, Menu } from 'lucide-react';
import { MessagingBadge } from './messaging/MessagingBadge';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationsContext';

const BottomNav = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 h-16 md:hidden z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-full px-4">
        <NavItem
          to="/dashboard"
          icon={Home}
          label="Home"
          active={isActive('/dashboard')}
        />

        <NavItem
          to="/alumni-directory"
          icon={Users}
          label="Alumni"
          active={isActive('/alumni-directory')}
        />

        <NavItem
          to="/jobs"
          icon={Briefcase}
          label="Jobs"
          active={location.pathname.includes('/jobs')}
        />

        <NavItem
          to="/events"
          icon={Calendar}
          label="Events"
          active={location.pathname.includes('/events')}
        />

        <NavItem
          to="/messages"
          icon={MessageCircle}
          label="Messages"
          active={isActive('/messages')}
          badge={<MessagingBadge />}
        />
        
        <NavItem
          to="/notifications"
          icon={Bell}
          label="Notifications"
          active={isActive('/notifications') || isActive('/notification-settings')}
          badge={unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-destructive text-white text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : undefined}
        />

        <NavItem
          to="/more"
          icon={Menu}
          label="More"
          active={isActive('/more') || 
                 isActive('/credentials') || 
                 isActive('/cv-maker') || 
                 isActive('/knowledge') || 
                 isActive('/my-applications') || 
                 isActive('/privacy-settings') || 
                 isActive('/profile')}
        />
      </div>
    </div>
  );
};

type NavItemProps = {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
  badge?: React.ReactNode;
};

const NavItem = ({ to, icon: Icon, label, active, badge }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex flex-col items-center justify-center space-y-1 relative",
        active ? "text-primary" : "text-gray-500 hover:text-primary"
      )}
    >
      <div className="relative">
        <Icon className="h-5 w-5" />
        {badge}
      </div>
      <span className="text-xs">{label}</span>
      {active && (
        <span className="absolute -bottom-4 h-1 w-8 bg-primary rounded-t-lg" />
      )}
    </Link>
  );
};

export default BottomNav;
