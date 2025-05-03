
import { useLocation, Link } from 'react-router-dom';
import { Home, Users, BookOpen, MessageCircle, Shield } from 'lucide-react';
import { MessagingBadge } from './messaging/MessagingBadge';

const BottomNav = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 h-16 md:hidden z-50">
      <div className="flex justify-around items-center h-full px-4">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/dashboard')
              ? 'text-primary'
              : 'text-gray-500 hover:text-primary'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs">Home</span>
        </Link>

        <Link
          to="/alumni-directory"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/alumni-directory')
              ? 'text-primary'
              : 'text-gray-500 hover:text-primary'
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-xs">Alumni</span>
        </Link>

        <Link
          to="/messages"
          className={`flex flex-col items-center justify-center space-y-1 relative ${
            isActive('/messages')
              ? 'text-primary'
              : 'text-gray-500 hover:text-primary'
          }`}
        >
          <div className="relative">
            <MessageCircle className="h-5 w-5" />
            <MessagingBadge />
          </div>
          <span className="text-xs">Messages</span>
        </Link>

        <Link
          to="/cv-maker"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/cv-maker')
              ? 'text-primary'
              : 'text-gray-500 hover:text-primary'
          }`}
        >
          <BookOpen className="h-5 w-5" />
          <span className="text-xs">CV</span>
        </Link>

        <Link
          to="/credential-wallet"
          className={`flex flex-col items-center justify-center space-y-1 ${
            isActive('/credential-wallet') || isActive('/credentials')
              ? 'text-primary'
              : 'text-gray-500 hover:text-primary'
          }`}
        >
          <Shield className="h-5 w-5" />
          <span className="text-xs">Credentials</span>
        </Link>
      </div>
    </div>
  );
};

export default BottomNav;
