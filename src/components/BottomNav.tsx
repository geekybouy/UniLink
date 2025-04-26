
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Home, BookOpen, PlusSquare, MessageCircle, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-around py-3">
          <Link to="/dashboard" className={`flex flex-col items-center ${location.pathname === '/dashboard' ? 'text-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/feed" className={`flex flex-col items-center ${location.pathname === '/feed' ? 'text-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}>
            <BookOpen className="h-6 w-6" />
            <span className="text-xs mt-1">Feed</span>
          </Link>
          <Link to="/new-post" className={`flex flex-col items-center ${location.pathname === '/new-post' ? 'text-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}>
            <PlusSquare className="h-6 w-6" />
            <span className="text-xs mt-1">New Post</span>
          </Link>
          <button className="flex flex-col items-center text-gray-500 hover:text-primary transition-colors">
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs mt-1">Chat</span>
          </button>
          <Link to="/profile" className={`flex flex-col items-center ${location.pathname === '/profile' ? 'text-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}>
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
