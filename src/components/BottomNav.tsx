
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, BookOpen, Shield, User, Plus } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-50">
      <div className="container mx-auto px-2">
        <div className="flex justify-around py-2">
          <Link 
            to="/dashboard" 
            className={`flex flex-col items-center px-2 py-1 ${location.pathname === '/dashboard' ? 'text-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <Link 
            to="/credential-wallet" 
            className={`flex flex-col items-center px-2 py-1 ${location.pathname === '/credential-wallet' ? 'text-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}
          >
            <Shield className="h-5 w-5" />
            <span className="text-xs mt-1">Credentials</span>
          </Link>
          
          <Link 
            to="/new-post" 
            className={`flex flex-col items-center px-2 py-1 ${location.pathname === '/new-post' ? 'text-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}
          >
            <div className="bg-primary rounded-full p-2 -mt-6 shadow-md">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs mt-4">Post</span>
          </Link>
          
          <Link 
            to="/cv-maker" 
            className={`flex flex-col items-center px-2 py-1 ${location.pathname === '/cv-maker' ? 'text-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-xs mt-1">CV</span>
          </Link>
          
          <Link 
            to="/profile" 
            className={`flex flex-col items-center px-2 py-1 ${location.pathname === '/profile' ? 'text-primary' : 'text-gray-500 hover:text-primary transition-colors'}`}
          >
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
