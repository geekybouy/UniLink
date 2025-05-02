
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, Bell, User, UserPlus, Users, BookOpen, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left side - Mobile menu and logo */}
        <div className="flex items-center space-x-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden px-2">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col gap-6 py-4">
                <h2 className="text-xl font-bold text-primary">UniLink</h2>
                <div className="flex flex-col space-y-3">
                  <Link 
                    to="/alumni-directory" 
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                  >
                    <Users className="h-4 w-4" /> Alumni Directory
                  </Link>
                  <Link 
                    to="/credential-wallet" 
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                  >
                    <Shield className="h-4 w-4" /> Credentials Wallet
                  </Link>
                  <Link 
                    to="/cv-maker" 
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                  >
                    <BookOpen className="h-4 w-4" /> CV Maker
                  </Link>
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                  >
                    <User className="h-4 w-4" /> My Profile
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <Link to="/dashboard" className="text-2xl font-playfair text-primary font-bold">
            UniLink
          </Link>
        </div>
        
        {/* Center - Desktop navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/dashboard" 
            className={`text-sm font-medium ${location.pathname === '/dashboard' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}
          >
            Home
          </Link>
          <Link 
            to="/alumni-directory" 
            className={`text-sm font-medium ${location.pathname === '/alumni-directory' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}
          >
            Alumni Directory
          </Link>
          <Link 
            to="/credential-wallet" 
            className={`text-sm font-medium ${location.pathname === '/credential-wallet' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}
          >
            Credentials
          </Link>
          <Link 
            to="/cv-maker" 
            className={`text-sm font-medium ${location.pathname === '/cv-maker' ? 'text-primary' : 'text-gray-600 hover:text-primary'} transition-colors`}
          >
            CV Maker
          </Link>
        </div>
        
        {/* Right side - Actions */}
        <div className="flex items-center space-x-3">
          {isSearchOpen ? (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input 
                className="border rounded-md pl-10 pr-4 py-2 text-sm w-full"
                placeholder="Search..." 
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
            </div>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setIsSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Link to="/profile">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatarUrl || ''} />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Header;
